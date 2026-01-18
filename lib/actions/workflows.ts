'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getWorkflowSteps } from '@/lib/records';

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

  const entityTypeId = String(formData.get('entityTypeId') || '').trim();
  if (!entityTypeId) {
    return { error: 'Entity type is required' };
  }

  const rawSteps = formData.get('steps');
  if (typeof rawSteps !== 'string') {
    return { error: 'Invalid payload' };
  }

  let parsed: Array<{ role: string; step: number }> = [];
  try {
    parsed = JSON.parse(rawSteps) as Array<{ role: string; step: number }>;
  } catch {
    return { error: 'Invalid payload' };
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { error: 'At least one step is required' };
  }

  const steps = getWorkflowSteps(parsed);
  if (steps.length === 0) {
    return { error: 'At least one valid step is required' };
  }

  for (const step of steps) {
    if (!ALLOWED_ROLES.has(step.role)) {
      return { error: `Invalid role: ${step.role}` };
    }
  }

  const entityType = await prisma.entityType.findFirst({
    where: { id: entityTypeId, organizationId: session.user.organizationId! },
  });

  if (!entityType) {
    return { error: 'Entity type not found' };
  }

  await prisma.workflowDefinition.upsert({
    where: { entityTypeId: entityType.id },
    update: { steps },
    create: {
      entityTypeId: entityType.id,
      steps,
    },
  });

  revalidatePath('/admin/workflows');
  revalidatePath('/requests/new');

  return { success: true };
}
