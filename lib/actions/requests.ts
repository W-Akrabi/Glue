'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createRequest(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  if (!title || !description) {
    return { error: 'Title and description are required' };
  }

  try {
    const workflowSteps = await prisma.approvalWorkflowStep.findMany({
      where: { organizationId: session.user.organizationId! },
      orderBy: { stepNumber: 'asc' },
    });

    if (workflowSteps.length === 0) {
      return { error: 'No approval workflow configured' };
    }

    const request = await prisma.request.create({
      data: {
        title,
        description,
        organizationId: session.user.organizationId!,
        createdById: session.user.id,
        approvalSteps: {
          create: workflowSteps.map((step) => ({
            stepNumber: step.stepNumber,
            requiredRole: step.requiredRole,
            status: 'PENDING',
          })),
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        entityType: 'REQUEST',
        entityId: request.id,
        action: 'CREATED',
        actorId: session.user.id,
        requestId: request.id,
        metadata: JSON.stringify({ title }),
      },
    });

    revalidatePath('/requests');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Failed to create request:', error);
    return { error: 'Failed to create request' };
  }

  redirect('/requests');
}

export async function approveRequest(requestId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  try {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { approvalSteps: { orderBy: { stepNumber: 'asc' } } },
    });

    if (!request) {
      return { error: 'Request not found' };
    }

    const currentStep = request.approvalSteps.find(
      (step) => step.stepNumber === request.currentStep
    );

    if (!currentStep) {
      return { error: 'Invalid workflow state' };
    }

    // Check if user has permission to approve this step
    const userRole = session.user.role;
    if (userRole !== currentStep.requiredRole && userRole !== 'ADMIN') {
      return { error: 'Insufficient permissions' };
    }

    const isLastStep = request.currentStep === request.approvalSteps.length;

    await prisma.$transaction([
      prisma.approvalStep.update({
        where: { id: currentStep.id },
        data: {
          status: 'APPROVED',
          approvedById: session.user.id,
          approvedAt: new Date(),
        },
      }),
      prisma.request.update({
        where: { id: requestId },
        data: {
          status: isLastStep ? 'APPROVED' : 'PENDING',
          currentStep: isLastStep ? request.currentStep : request.currentStep + 1,
        },
      }),
      prisma.auditLog.create({
        data: {
          entityType: 'REQUEST',
          entityId: requestId,
          action: 'APPROVED',
          actorId: session.user.id,
          requestId: requestId,
          metadata: JSON.stringify({ step: request.currentStep }),
        },
      }),
    ]);

    revalidatePath(`/requests/${requestId}`);
    revalidatePath('/requests');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to approve request:', error);
    return { error: 'Failed to approve request' };
  }
}

export async function rejectRequest(requestId: string, reason?: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  try {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { approvalSteps: true },
    });

    if (!request) {
      return { error: 'Request not found' };
    }

    const currentStep = request.approvalSteps.find(
      (step) => step.stepNumber === request.currentStep
    );

    if (!currentStep) {
      return { error: 'Invalid workflow state' };
    }

    const userRole = session.user.role;
    if (userRole !== currentStep.requiredRole && userRole !== 'ADMIN') {
      return { error: 'Insufficient permissions' };
    }

    await prisma.$transaction([
      prisma.approvalStep.update({
        where: { id: currentStep.id },
        data: {
          status: 'REJECTED',
          approvedById: session.user.id,
          approvedAt: new Date(),
        },
      }),
      prisma.request.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      }),
      prisma.auditLog.create({
        data: {
          entityType: 'REQUEST',
          entityId: requestId,
          action: 'REJECTED',
          actorId: session.user.id,
          requestId: requestId,
          metadata: JSON.stringify({ step: request.currentStep, reason }),
        },
      }),
    ]);

    revalidatePath(`/requests/${requestId}`);
    revalidatePath('/requests');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to reject request:', error);
    return { error: 'Failed to reject request' };
  }
}
