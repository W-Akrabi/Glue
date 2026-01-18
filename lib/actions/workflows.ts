'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const ALLOWED_ROLES = new Set(['MEMBER', 'APPROVER', 'ADMIN']);

type WorkflowState = {
  error?: string;
  success?: boolean;
};

export async function updateWorkflow(_prevState: WorkflowState, formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  if (session.user.role !== 'ADMIN') {
    return { error: 'Forbidden' };
  }

  const rawSteps = formData.get('steps');
  if (typeof rawSteps !== 'string') {
    return { error: 'Invalid payload' };
  }

  let parsed: Array<{ requiredRole: string }> = [];
  try {
    parsed = JSON.parse(rawSteps) as Array<{ requiredRole: string }>;
  } catch {
    return { error: 'Invalid payload' };
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { error: 'At least one step is required' };
  }

  const steps = parsed.map((step, index) => ({
    stepNumber: index + 1,
    requiredRole: String(step.requiredRole || '').toUpperCase(),
  }));

  for (const step of steps) {
    if (!ALLOWED_ROLES.has(step.requiredRole)) {
      return { error: `Invalid role: ${step.requiredRole}` };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.approvalWorkflowStep.deleteMany({
      where: { organizationId: session.user.organizationId! },
    });

    await tx.approvalWorkflowStep.createMany({
      data: steps.map((step) => ({
        organizationId: session.user.organizationId!,
        stepNumber: step.stepNumber,
        requiredRole: step.requiredRole,
      })),
    });
  });

  return { success: true };
}
