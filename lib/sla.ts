import { prisma } from '@/lib/prisma';
import { getEntitySchema, getRecordTitle, getWorkflowSteps } from '@/lib/records';

export type SlaRunResult = {
  notified: number;
  escalated: number;
  checked: number;
};

function formatOverdue(dueAt: Date) {
  const diffMs = Date.now() - dueAt.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 24) {
    return `${hours} hours`;
  }
  const days = Math.floor(hours / 24);
  return `${days} days`;
}

export async function runSlaCheckJob(): Promise<SlaRunResult> {
  const now = new Date();
  const overdueSteps = await prisma.workflowStepInstance.findMany({
    where: {
      status: 'PENDING',
      dueAt: { lte: now },
    },
    include: {
      workflowInstance: {
        include: {
          record: {
            include: { entityType: { include: { workflowDefinition: true } } },
          },
        },
      },
    },
  });

  let notified = 0;
  let escalated = 0;

  for (const stepInstance of overdueSteps) {
    if (!stepInstance.dueAt) {
      continue;
    }
    if (stepInstance.lastSlaNotifiedAt) {
      continue;
    }

    const record = stepInstance.workflowInstance?.record;
    if (!record) {
      continue;
    }

    const steps = getWorkflowSteps(record.entityType.workflowDefinition?.steps ?? []);
    const stepConfig = steps.find((step) => step.step === stepInstance.stepNumber);
    if (!stepConfig || !stepConfig.slaHours) {
      continue;
    }

    const schema = getEntitySchema(record.entityType.schema);
    const title = getRecordTitle(record.data as Record<string, unknown>, schema);
    const overdueFor = formatOverdue(stepInstance.dueAt);

    const assignedApproverIds = Array.isArray(stepInstance.assignedApproverIds)
      ? stepInstance.assignedApproverIds.map((id) => String(id))
      : [];
    const escalationUserIds = stepConfig.escalationUserIds ?? [];
    const notificationTargets = Array.from(
      new Set([...assignedApproverIds, ...escalationUserIds])
    );

    if (notificationTargets.length > 0) {
      await prisma.notification.createMany({
        data: notificationTargets.map((userId) => ({
          userId,
          recordId: record.id,
          title: `Approval overdue by ${overdueFor}`,
          body: `Record "${title}" is overdue for approval.`,
        })),
      });
      notified += notificationTargets.length;
    }

    if (stepConfig.autoEscalate && escalationUserIds.length > 0) {
      const nextApproverIds = Array.from(
        new Set([...assignedApproverIds, ...escalationUserIds])
      );
      await prisma.workflowStepInstance.update({
        where: { id: stepInstance.id },
        data: {
          assignedApproverIds: nextApproverIds,
          escalatedAt: stepInstance.escalatedAt ?? now,
        },
      });
      escalated += escalationUserIds.length;
    }

    await prisma.workflowStepInstance.update({
      where: { id: stepInstance.id },
      data: { lastSlaNotifiedAt: now },
    });
  }

  return { notified, escalated, checked: overdueSteps.length };
}
