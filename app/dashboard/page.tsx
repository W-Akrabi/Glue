import { auth, signOut } from '@/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { getEntitySchema, getRecordDescription, getRecordTitle } from '@/lib/records';
import { cn } from '@/lib/utils';
import {
  getNextActionLabel,
  getRecordStatusBadgeClasses,
  getRecordStatusLabel,
  isPendingApprovalStatus,
} from '@/lib/records/status';
import { getOverdueLabel } from '@/lib/records/sla';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const stats = await prisma.record.groupBy({
    by: ['status'],
    where: { organizationId: session.user.organizationId! },
    _count: true,
  });

  const pendingCount = stats.reduce(
    (total, stat) => (isPendingApprovalStatus(stat.status) ? total + stat._count : total),
    0
  );
  const approvedCount = stats.find((s) => s.status === 'APPROVED')?._count || 0;
  const rejectedCount = stats.find((s) => s.status === 'REJECTED')?._count || 0;

  const recentRecords = await prisma.record.findMany({
    where: { organizationId: session.user.organizationId! },
    include: {
      createdBy: { select: { name: true, email: true } },
      entityType: { include: { workflowDefinition: true } },
      workflowInstance: { include: { steps: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const allRecords = await prisma.record.findMany({
    where: { organizationId: session.user.organizationId! },
    include: {
      createdBy: { select: { name: true, email: true } },
      entityType: { include: { workflowDefinition: true } },
      workflowInstance: { include: { steps: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id, readAt: null },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const orgUsers = await prisma.user.findMany({
    where: { organizationId: session.user.organizationId! },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });
  const orgUserMap = new Map(orgUsers.map((user) => [user.id, user]));

  const actionableRecords = allRecords.filter((record) => {
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
    return session.user.role === requiredRole && assignedApproverIds.includes(session.user.id);
  });

  const totalCount = pendingCount + approvedCount + rejectedCount;
  const approvalRate = totalCount === 0 ? 0 : Math.round((approvedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Glue</h1>
              <p className="text-sm text-gray-400">Internal Tools</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-xs text-gray-500">{session.user.role}</p>
              </div>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/login' });
                }}
              >
                <Button type="submit" variant="ghost" size="sm" data-testid="logout-button">
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <Link
              href="/org-select"
              className="px-3 py-4 text-sm font-medium text-gray-400 hover:text-white transition"
              data-testid="nav-org-select"
            >
              Organization
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-4 text-sm font-medium text-emerald-300 border-b-2 border-emerald-400"
              data-testid="nav-dashboard"
            >
              Dashboard
            </Link>
            <Link
              href="/requests"
              className="px-3 py-4 text-sm font-medium text-gray-400 hover:text-white transition"
              data-testid="nav-requests"
            >
              Records
            </Link>
            {session.user.role !== 'VIEWER' ? (
              <Link
                href="/requests/new"
                className="px-3 py-4 text-sm font-medium text-gray-400 hover:text-white transition"
                data-testid="nav-new-request"
              >
                New Record
              </Link>
            ) : null}
            {session.user.role === 'ADMIN' && (
              <>
                <Link
                  href="/admin/entity-types"
                  className="px-3 py-4 text-sm font-medium text-gray-400 hover:text-white transition"
                  data-testid="nav-admin-entity-types"
                >
                  Entity Types
                </Link>
                <Link
                  href="/admin/workflows"
                  className="px-3 py-4 text-sm font-medium text-gray-400 hover:text-white transition"
                  data-testid="nav-admin-workflows"
                >
                  Workflows
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-white/10 bg-gradient-to-br from-neutral-900 to-black">
            <CardContent className="p-8 space-y-6">
              <div>
                <p className="text-sm text-muted-foreground">Overview</p>
                <h2 className="text-3xl font-semibold mt-2">Approval pipeline at a glance</h2>
                <p className="text-sm text-gray-400 mt-2">
                  Track the volume and momentum of approvals across all record types.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Total records</p>
                  <p className="text-3xl font-semibold mt-2">{totalCount}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Approval rate</p>
                  <p className="text-3xl font-semibold mt-2">{approvalRate}%</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Pending</span>
                  <span>{pendingCount}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-amber-400/70 rounded-full"
                    style={{ width: totalCount === 0 ? '0%' : `${(pendingCount / totalCount) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Approved</span>
                  <span>{approvedCount}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400/70 rounded-full"
                    style={{ width: totalCount === 0 ? '0%' : `${(approvedCount / totalCount) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Rejected</span>
                  <span>{rejectedCount}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-rose-400/70 rounded-full"
                    style={{ width: totalCount === 0 ? '0%' : `${(rejectedCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-neutral-900/70">
            <CardContent className="p-6 space-y-6">
              <div>
                <p className="text-sm text-muted-foreground">Quick actions</p>
                <h3 className="text-xl font-semibold mt-2">Keep work moving</h3>
              </div>
              <div className="space-y-3">
                <Link
                  href="/requests/new"
                  className="block rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm font-medium hover:border-emerald-500/60 hover:text-emerald-200 transition"
                >
                  Create new record
                </Link>
                <Link
                  href="/requests"
                  className="block rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm font-medium hover:border-emerald-500/60 hover:text-emerald-200 transition"
                >
                  Review all records
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin/entity-types"
                    className="block rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm font-medium hover:border-emerald-500/60 hover:text-emerald-200 transition"
                  >
                    Manage entity types
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card data-testid="stat-pending" className="border-white/10 bg-neutral-900/70">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-amber-300 mt-2">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/15 rounded-full flex items-center justify-center text-amber-200">
                <span className="text-2xl">⏳</span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-approved" className="border-white/10 bg-neutral-900/70">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold text-emerald-300 mt-2">{approvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/15 rounded-full flex items-center justify-center text-emerald-200">
                <span className="text-2xl">✓</span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-rejected" className="border-white/10 bg-neutral-900/70">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-3xl font-bold text-rose-300 mt-2">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 bg-rose-500/15 rounded-full flex items-center justify-center text-rose-200">
                <span className="text-2xl">✗</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-white/10 bg-neutral-900/70">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Records</h2>
              <Link href="/requests" className="text-xs text-emerald-300 hover:text-emerald-200">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-white/10">
              {recentRecords.length === 0 ? (
                <div className="px-6 py-12 text-center text-muted-foreground">
                  No records yet.{" "}
                  <Link href="/requests/new" className="text-primary hover:underline">
                    Create one
                  </Link>
                </div>
              ) : (
                recentRecords.map((request) => {
                  const schema = getEntitySchema(request.entityType.schema);
                  const data = request.data as Record<string, unknown>;
                  const title = getRecordTitle(data, schema);
                  const description = getRecordDescription(data, schema);
                  const stepsTotal = request.workflowInstance?.steps.length || 0;
                  const steps = Array.isArray(request.entityType.workflowDefinition?.steps)
                    ? request.entityType.workflowDefinition!.steps
                    : [];
                  const currentStep = request.workflowInstance?.currentStep ?? 0;
                  const currentStepInstance = request.workflowInstance?.steps.find(
                    (step) => step.stepNumber === currentStep
                  );
                  const assignedApproverIds = Array.isArray(currentStepInstance?.assignedApproverIds)
                    ? currentStepInstance?.assignedApproverIds.map((id) => String(id))
                    : [];
                  const assignedApproverNames = assignedApproverIds
                    .map((id) => orgUserMap.get(id))
                    .filter(Boolean)
                    .map((user) => user?.name || user?.email);
                  const overdueLabel = getOverdueLabel(currentStepInstance?.dueAt ?? null);

                  return (
                  <Link
                    key={request.id}
                    href={`/requests/${request.id}`}
                    className="block px-6 py-4 hover:bg-white/5 transition"
                    data-testid={`request-${request.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium">{title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {request.entityType.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            by {request.createdBy.name || request.createdBy.email}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Step {request.workflowInstance?.currentStep ?? 0} of {stepsTotal}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium border",
                            getRecordStatusBadgeClasses(request.status)
                          )}
                          data-testid={`status-${request.id}`}
                          variant="secondary"
                        >
                          {getRecordStatusLabel(request.status)}
                        </Badge>
                        <p className="mt-1 text-xs text-gray-400">
                          {getNextActionLabel(
                            request.status,
                            assignedApproverNames.length > 0
                              ? assignedApproverNames.join(', ')
                              : steps.find((step: { step?: number; role?: string }) => step.step === currentStep)
                                  ?.role
                          )}
                        </p>
                        {overdueLabel ? <p className="mt-1 text-xs text-rose-200">{overdueLabel}</p> : null}
                      </div>
                    </div>
                  </Link>
                  );
                })
              )}
            </div>
          </Card>

          <Card className="border-white/10 bg-neutral-900/70">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className="text-xs text-gray-500 mt-1">Latest SLA reminders</p>
            </div>
            <div className="divide-y divide-white/10">
              {notifications.length === 0 ? (
                <div className="px-6 py-10 text-sm text-muted-foreground">
                  No new notifications.
                </div>
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

          <Card className="border-white/10 bg-neutral-900/70">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-semibold">Needs your approval</h2>
              <p className="text-xs text-gray-500 mt-1">
                {actionableRecords.length} items waiting on you
              </p>
            </div>
            <div className="divide-y divide-white/10">
              {actionableRecords.length === 0 ? (
                <div className="px-6 py-10 text-sm text-muted-foreground">
                  You are all caught up.
                </div>
              ) : (
                actionableRecords.slice(0, 5).map((record) => {
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
                          <p className="text-xs text-muted-foreground mt-1">
                            {record.entityType.name}
                          </p>
                        </div>
                        <span className="text-xs text-emerald-300">Review</span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
