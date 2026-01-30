'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getCreateRoles, getEntitySchema, getWorkflowSteps } from '@/lib/records';
import { getApprovalError } from '@/lib/records/approval';
import { extractMentions } from '@/lib/records/comments';
import { isPendingApprovalStatus } from '@/lib/records/status';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const ALLOWED_ROLES = new Set(['MEMBER', 'ADMIN']);

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
  if (steps.some((step) => !step.approverIds || step.approverIds.length === 0)) {
    return { error: 'Workflow steps must have assigned approvers' };
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
    const now = new Date();
    const firstStep = steps[0];
    const firstDueAt =
      firstStep?.slaHours && Number.isFinite(firstStep.slaHours)
        ? new Date(now.getTime() + firstStep.slaHours * 60 * 60 * 1000)
        : null;
    const record = await prisma.record.create({
      data: {
        entityTypeId: entityType.id,
        organizationId: session.user.organizationId!,
        createdById: session.user.id,
        data: payload,
        status: 'PENDING_APPROVAL',
        workflowInstance: {
          create: {
            currentStep: steps[0].step,
            status: 'PENDING_APPROVAL',
            steps: {
              create: steps.map((step, index) => ({
                stepNumber: step.step,
                status: 'PENDING',
                assignedApproverIds: step.approverIds ?? [],
                dueAt: index === 0 ? firstDueAt : null,
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

export async function approveRecord(
  recordId: string,
  _prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const rawComment = String(formData.get('comment') || '').trim();
  const comment = rawComment.length > 0 ? rawComment : undefined;
  const mentions = comment ? extractMentions(comment) : [];

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

    const assignedApproverIds = Array.isArray(currentStep.assignedApproverIds)
      ? currentStep.assignedApproverIds.map((id) => String(id))
      : [];

    const unresolvedBlockers = await prisma.comment.count({
      where: {
        recordId,
        resolvedAt: null,
        type: 'BLOCKER',
        parentId: null,
      },
    });

    const approvalError = getApprovalError({
      recordStatus: record.status,
      workflowStatus: record.workflowInstance.status,
      stepStatus: currentStep.status,
      requiredRole,
      assignedApproverIds,
      userRole: session.user.role,
      userId: session.user.id,
      openBlockers: unresolvedBlockers,
    });
    if (approvalError) {
      return { error: approvalError };
    }

    const currentIndex = steps.findIndex(
      (step) => step.step === record.workflowInstance!.currentStep
    );
    const isLastStep = currentIndex === steps.length - 1;
    const nextStep = isLastStep ? record.workflowInstance.currentStep : steps[currentIndex + 1]?.step;
    const nextStepConfig = steps[currentIndex + 1];
    const nextDueAt =
      nextStepConfig?.slaHours && Number.isFinite(nextStepConfig.slaHours)
        ? new Date(Date.now() + nextStepConfig.slaHours * 60 * 60 * 1000)
        : null;
    const nextStepInstance = record.workflowInstance.steps.find(
      (step) => step.stepNumber === nextStep
    );

    const approvalMetadata: Record<string, unknown> = {
      step: record.workflowInstance.currentStep,
    };
    if (comment) {
      approvalMetadata.comment = comment;
    }
    if (mentions.length > 0) {
      approvalMetadata.mentions = mentions;
    }

    const updates = [
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
          status: isLastStep ? 'APPROVED' : 'PENDING_APPROVAL',
          currentStep: nextStep ?? record.workflowInstance.currentStep,
        },
      }),
      prisma.record.update({
        where: { id: recordId },
        data: { status: isLastStep ? 'APPROVED' : 'PENDING_APPROVAL' },
      }),
      prisma.auditLog.create({
        data: {
          entityType: record.entityTypeId,
          entityId: recordId,
          action: 'APPROVED',
          actorId: session.user.id,
          metadata: approvalMetadata,
        },
      }),
    ];

    if (!isLastStep && nextStepInstance) {
      updates.push(
        prisma.workflowStepInstance.update({
          where: { id: nextStepInstance.id },
          data: { dueAt: nextDueAt },
        })
      );
    }

    await prisma.$transaction(updates);

    revalidatePath(`/requests/${recordId}`);
    revalidatePath('/requests');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to approve record:', error);
    return { error: 'Failed to approve record' };
  }
}

export async function rejectRecord(
  recordId: string,
  _prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const rawComment = String(formData.get('comment') || '').trim();
  if (!rawComment) {
    return { error: 'Comment is required to reject.' };
  }
  const mentions = extractMentions(rawComment);

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

    if (!isPendingApprovalStatus(record.status)) {
      return { error: 'Record is not pending approval' };
    }

    if (!isPendingApprovalStatus(record.workflowInstance.status)) {
      return { error: 'Workflow is not pending approval' };
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

    if (currentStep.status !== 'PENDING') {
      return { error: 'Current step has already been resolved' };
    }

    const requiredRole =
      steps.find((step) => step.step === record.workflowInstance!.currentStep)?.role || '';

    if (requiredRole && !ALLOWED_ROLES.has(requiredRole)) {
      return { error: 'Invalid workflow role configuration' };
    }

    const assignedApproverIds = Array.isArray(currentStep.assignedApproverIds)
      ? currentStep.assignedApproverIds.map((id) => String(id))
      : [];

    if (assignedApproverIds.length === 0) {
      return { error: 'Approvers have not been assigned for this step' };
    }

    if (!assignedApproverIds.includes(session.user.id)) {
      return { error: 'You are not assigned to this approval step' };
    }

    if (requiredRole && session.user.role !== requiredRole) {
      return { error: 'Insufficient permissions' };
    }

    const rejectionMetadata: Record<string, unknown> = {
      step: record.workflowInstance.currentStep,
      comment: rawComment,
    };
    if (mentions.length > 0) {
      rejectionMetadata.mentions = mentions;
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
          metadata: rejectionMetadata,
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
