'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getWorkflowSteps } from '@/lib/records';

const ALLOWED_ROLES = new Set(['MEMBER', 'ADMIN']);

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

  let parsed: Array<{
    role: string;
    step: number;
    approverIds?: string[];
    slaHours?: number;
    escalationUserIds?: string[];
    autoEscalate?: boolean;
  }> = [];
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
    if (!step.approverIds || step.approverIds.length === 0) {
      return { error: 'Each step must have at least one approver' };
    }
    if (step.slaHours !== undefined && (Number.isNaN(step.slaHours) || step.slaHours <= 0)) {
      return { error: 'SLA hours must be a positive number' };
    }
  }

  const entityType = await prisma.entityType.findFirst({
    where: { id: entityTypeId, organizationId: session.user.organizationId! },
  });

  if (!entityType) {
    return { error: 'Entity type not found' };
  }

  const users = await prisma.user.findMany({
    where: { organizationId: session.user.organizationId! },
    select: { id: true, role: true },
  });
  const allowedUserIds = new Set(users.map((user) => user.id));
  const userRoleMap = new Map(users.map((user) => [user.id, String(user.role)]));
  for (const step of steps) {
    for (const approverId of step.approverIds ?? []) {
      if (!allowedUserIds.has(approverId)) {
        return { error: 'Invalid approver selection' };
      }
      if (userRoleMap.get(approverId) !== step.role) {
        return { error: `Approver role must match step role (${step.role})` };
      }
    }
    for (const escalationUserId of step.escalationUserIds ?? []) {
      if (!allowedUserIds.has(escalationUserId)) {
        return { error: 'Invalid escalation user selection' };
      }
    }
    if (step.autoEscalate && (!step.escalationUserIds || step.escalationUserIds.length === 0)) {
      return { error: 'Auto-escalation requires at least one escalation user' };
    }
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
