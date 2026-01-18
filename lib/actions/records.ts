'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getCreateRoles, getEntitySchema, getWorkflowSteps } from '@/lib/records';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const ALLOWED_ROLES = new Set(['MEMBER', 'APPROVER', 'ADMIN']);

export async function createRecord(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const entityTypeId = String(formData.get('entityTypeId') || '').trim();
  if (!entityTypeId) {
    return { error: 'Entity type is required' };
  }

  const entityType = await prisma.entityType.findFirst({
    where: { id: entityTypeId, organizationId: session.user.organizationId! },
    include: { workflowDefinition: true },
  });

  if (!entityType) {
    return { error: 'Entity type not found' };
  }

  const schema = getEntitySchema(entityType.schema);
  const createRoles = getCreateRoles(schema);
  if (createRoles.length > 0 && !createRoles.includes(session.user.role)) {
    return { error: 'You do not have permission to create this record type' };
  }

  const steps = getWorkflowSteps(entityType.workflowDefinition?.steps ?? []);
  if (steps.length === 0) {
    return { error: 'No workflow definition configured' };
  }

  const payload: Record<string, unknown> = {};
  for (const field of schema.fields) {
    const raw = formData.get(field.key);
    if (field.required && (raw === null || String(raw).trim() === '')) {
      return { error: `${field.label || field.key} is required` };
    }
    if (raw === null) {
      continue;
    }
    if (field.type === 'number') {
      const parsed = Number(raw);
      payload[field.key] = Number.isFinite(parsed) ? parsed : raw;
    } else {
      payload[field.key] = raw;
    }
  }

  try {
    const record = await prisma.record.create({
      data: {
        entityTypeId: entityType.id,
        organizationId: session.user.organizationId!,
        createdById: session.user.id,
        data: payload,
        workflowInstance: {
          create: {
            currentStep: steps[0].step,
            status: 'PENDING',
            steps: {
              create: steps.map((step) => ({
                stepNumber: step.step,
                status: 'PENDING',
              })),
            },
          },
        },
      },
      include: { workflowInstance: true },
    });

    await prisma.auditLog.create({
      data: {
        entityType: entityType.id,
        entityId: record.id,
        action: 'CREATED',
        actorId: session.user.id,
        metadata: { entityTypeName: entityType.name },
      },
    });

    revalidatePath('/requests');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Failed to create record:', error);
    return { error: 'Failed to create record' };
  }

  redirect('/requests');
}

export async function approveRecord(recordId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  try {
    const record = await prisma.record.findUnique({
      where: { id: recordId },
      include: {
        entityType: { include: { workflowDefinition: true } },
        workflowInstance: { include: { steps: { orderBy: { stepNumber: 'asc' } } } },
      },
    });

    if (!record || !record.workflowInstance) {
      return { error: 'Record not found' };
    }

    const steps = getWorkflowSteps(record.entityType.workflowDefinition?.steps ?? []);
    if (steps.length === 0) {
      return { error: 'Workflow definition missing' };
    }

    const currentStep = record.workflowInstance.steps.find(
      (step) => step.stepNumber === record.workflowInstance!.currentStep
    );

    if (!currentStep) {
      return { error: 'Invalid workflow state' };
    }

    const requiredRole =
      steps.find((step) => step.step === record.workflowInstance!.currentStep)?.role || '';

    if (requiredRole && !ALLOWED_ROLES.has(requiredRole)) {
      return { error: 'Invalid workflow role configuration' };
    }

    if (session.user.role !== requiredRole && session.user.role !== 'ADMIN') {
      return { error: 'Insufficient permissions' };
    }

    const currentIndex = steps.findIndex(
      (step) => step.step === record.workflowInstance!.currentStep
    );
    const isLastStep = currentIndex === steps.length - 1;
    const nextStep = isLastStep ? record.workflowInstance.currentStep : steps[currentIndex + 1]?.step;

    await prisma.$transaction([
      prisma.workflowStepInstance.update({
        where: { id: currentStep.id },
        data: {
          status: 'APPROVED',
          approvedById: session.user.id,
          approvedAt: new Date(),
        },
      }),
      prisma.workflowInstance.update({
        where: { id: record.workflowInstance.id },
        data: {
          status: isLastStep ? 'APPROVED' : 'PENDING',
          currentStep: nextStep ?? record.workflowInstance.currentStep,
        },
      }),
      prisma.record.update({
        where: { id: recordId },
        data: { status: isLastStep ? 'APPROVED' : 'PENDING' },
      }),
      prisma.auditLog.create({
        data: {
          entityType: record.entityTypeId,
          entityId: recordId,
          action: 'APPROVED',
          actorId: session.user.id,
          metadata: { step: record.workflowInstance.currentStep },
        },
      }),
    ]);

    revalidatePath(`/requests/${recordId}`);
    revalidatePath('/requests');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to approve record:', error);
    return { error: 'Failed to approve record' };
  }
}

export async function rejectRecord(recordId: string, reason?: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  try {
    const record = await prisma.record.findUnique({
      where: { id: recordId },
      include: {
        entityType: { include: { workflowDefinition: true } },
        workflowInstance: { include: { steps: { orderBy: { stepNumber: 'asc' } } } },
      },
    });

    if (!record || !record.workflowInstance) {
      return { error: 'Record not found' };
    }

    const steps = getWorkflowSteps(record.entityType.workflowDefinition?.steps ?? []);
    if (steps.length === 0) {
      return { error: 'Workflow definition missing' };
    }

    const currentStep = record.workflowInstance.steps.find(
      (step) => step.stepNumber === record.workflowInstance!.currentStep
    );

    if (!currentStep) {
      return { error: 'Invalid workflow state' };
    }

    const requiredRole =
      steps.find((step) => step.step === record.workflowInstance!.currentStep)?.role || '';

    if (requiredRole && !ALLOWED_ROLES.has(requiredRole)) {
      return { error: 'Invalid workflow role configuration' };
    }

    if (session.user.role !== requiredRole && session.user.role !== 'ADMIN') {
      return { error: 'Insufficient permissions' };
    }

    await prisma.$transaction([
      prisma.workflowStepInstance.update({
        where: { id: currentStep.id },
        data: {
          status: 'REJECTED',
          approvedById: session.user.id,
          approvedAt: new Date(),
        },
      }),
      prisma.workflowInstance.update({
        where: { id: record.workflowInstance.id },
        data: { status: 'REJECTED' },
      }),
      prisma.record.update({
        where: { id: recordId },
        data: { status: 'REJECTED' },
      }),
      prisma.auditLog.create({
        data: {
          entityType: record.entityTypeId,
          entityId: recordId,
          action: 'REJECTED',
          actorId: session.user.id,
          metadata: { step: record.workflowInstance.currentStep, reason },
        },
      }),
    ]);

    revalidatePath(`/requests/${recordId}`);
    revalidatePath('/requests');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to reject record:', error);
    return { error: 'Failed to reject record' };
  }
}
