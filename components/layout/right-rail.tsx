import { prisma } from '@/lib/prisma';
import { getEntitySchema, getRecordTitle } from '@/lib/records';
import { isPendingApprovalStatus } from '@/lib/records/status';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default async function RightRail({
  userId,
  organizationId,
  role,
}: {
  userId: string;
  organizationId: string;
  role: string;
}) {
  const stats = await prisma.record.groupBy({
    by: ['status'],
    where: { organizationId },
    _count: true,
  });

  const pendingCount = stats.reduce(
    (total, stat) => (isPendingApprovalStatus(stat.status) ? total + stat._count : total),
    0
  );
  const approvedCount = stats.find((s) => s.status === 'APPROVED')?._count || 0;
  const rejectedCount = stats.find((s) => s.status === 'REJECTED')?._count || 0;
  const totalCount = pendingCount + approvedCount + rejectedCount;
  const approvalRate = totalCount === 0 ? 0 : Math.round((approvedCount / totalCount) * 100);

  const actionableRecords = await prisma.record.findMany({
    where: { organizationId },
    include: {
      entityType: { include: { workflowDefinition: true } },
      workflowInstance: { include: { steps: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const actionable = actionableRecords.filter((record) => {
    if (!isPendingApprovalStatus(record.status)) {
      return false;
    }
    const steps = Array.isArray(record.entityType.workflowDefinition?.steps)
      ? record.entityType.workflowDefinition!.steps
      : [];
    const currentStep = record.workflowInstance?.currentStep ?? 0;
    const requiredRole = steps.find((step: { step?: number; role?: string }) => step.step === currentStep)?.role;
    const currentStepInstance = record.workflowInstance?.steps.find(
      (step) => step.stepNumber === currentStep
    );
    const assignedApproverIds = Array.isArray(currentStepInstance?.assignedApproverIds)
      ? currentStepInstance?.assignedApproverIds.map((id) => String(id))
      : [];
    if (assignedApproverIds.length === 0) {
      return false;
    }
    if (!requiredRole) {
      return false;
    }
    return role === requiredRole && assignedApproverIds.includes(userId);
  });

  const notifications = await prisma.notification.findMany({
    where: { userId, readAt: null },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <div className="hidden w-80 shrink-0 flex-col gap-6 lg:flex">
      <Card className="border-white/10 bg-[#141821]">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Insights</p>
              <h3 className="text-lg font-semibold">Approval momentum</h3>
            </div>
            <span className="text-xs text-emerald-300">{approvalRate}%</span>
          </div>
          <div className="space-y-3 text-xs text-gray-400">
            <div className="flex items-center justify-between">
              <span>Pending approvals</span>
              <span className="text-white">{pendingCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Approved this period</span>
              <span className="text-white">{approvedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Rejected</span>
              <span className="text-white">{rejectedCount}</span>
            </div>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">
            Keep momentum high by clearing the approvals waiting on you.
          </div>
        </div>
      </Card>

      <Card className="border-white/10 bg-[#141821]">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">Needs your approval</h2>
          <p className="text-xs text-gray-500 mt-1">{actionable.length} items waiting on you</p>
        </div>
        <div className="divide-y divide-white/10">
          {actionable.length === 0 ? (
            <div className="px-6 py-10 text-sm text-muted-foreground">You are all caught up.</div>
          ) : (
            actionable.slice(0, 5).map((record) => {
              const schema = getEntitySchema(record.entityType.schema);
              const data = record.data as Record<string, unknown>;
              const title = getRecordTitle(data, schema);
              return (
                <Link
                  key={record.id}
                  href={`/requests/${record.id}`}
                  className="block px-6 py-4 hover:bg-white/5 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{record.entityType.name}</p>
                    </div>
                    <span className="text-xs text-emerald-300">Review</span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </Card>

      <Card className="border-white/10 bg-[#141821]">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="text-xs text-gray-500 mt-1">Latest SLA reminders</p>
        </div>
        <div className="divide-y divide-white/10">
          {notifications.length === 0 ? (
            <div className="px-6 py-10 text-sm text-muted-foreground">No new notifications.</div>
          ) : (
            notifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.recordId ? `/requests/${notification.recordId}` : '/requests'}
                className="block px-6 py-4 hover:bg-white/5 transition"
              >
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.body}</p>
                <p className="text-[10px] text-gray-500 mt-2">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
