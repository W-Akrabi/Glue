import { auth } from '@/auth';
import { Badge } from '@/components/ui/badge';
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
import AppShell from '@/components/layout/app-shell';

type SearchParams = { [key: string]: string | string[] | undefined };

function getParam(searchParams: SearchParams | undefined, key: string) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const resolvedSearchParams =
    typeof (searchParams as Promise<SearchParams>)?.then === 'function'
      ? await (searchParams as Promise<SearchParams>)
      : (searchParams as SearchParams | undefined);
  const query = (getParam(resolvedSearchParams, 'q') || '').trim().toLowerCase();

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

  const orgUsers = await prisma.user.findMany({
    where: { organizationId: session.user.organizationId! },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });
  const orgUserMap = new Map(orgUsers.map((user) => [user.id, user]));

  const filteredRecords = query
    ? allRecords.filter((record) => {
        const schema = getEntitySchema(record.entityType.schema);
        const data = record.data as Record<string, unknown>;
        const title = getRecordTitle(data, schema);
        const description = getRecordDescription(data, schema);
        const haystacks = [
          title,
          description,
          record.entityType.name,
          record.createdBy.name || '',
          record.createdBy.email || '',
        ]
          .join(' ')
          .toLowerCase();
        return haystacks.includes(query);
      })
    : allRecords;

  const totalCount = pendingCount + approvedCount + rejectedCount;
  const approvalRate = totalCount === 0 ? 0 : Math.round((approvedCount / totalCount) * 100);

  return (
    <AppShell
      session={session}
      activeNav="dashboard"
      headerTitle="Records"
      headerSubtitle="Projects / Glue"
      topAction={{ label: 'Create', href: '/requests/new' }}
      search={{ name: 'q', value: query, placeholder: 'Search records, people, or entities' }}
    >
      <div className="mb-5 flex flex-wrap items-center gap-3" data-tour="dashboard-kpis">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-300">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> Pending {pendingCount}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Approved {approvedCount}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-300">
          <span className="h-2 w-2 rounded-full bg-rose-400" /> Rejected {rejectedCount}
        </div>
        <div className="ml-auto hidden items-center gap-2 text-xs text-gray-400 md:flex">
          <span>Approval rate</span>
          <span className="text-white">{approvalRate}%</span>
        </div>
      </div>

      <Card className="border-white/10 bg-card" data-tour="dashboard-records">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Records</p>
              <h2 className="text-xl font-semibold">
                All records {query ? `(${filteredRecords.length})` : ''}
              </h2>
            </div>
            <Link href="/requests" className="text-xs text-emerald-300 hover:text-emerald-200">
              Open full list
            </Link>
          </div>
          <div className="divide-y divide-white/10">
            {filteredRecords.length === 0 ? (
              <div className="px-6 py-12 text-center text-muted-foreground">
                No records yet.{' '}
                <Link href="/requests/new" className="text-primary hover:underline">
                  Create one
                </Link>
              </div>
            ) : (
              filteredRecords.map((request) => {
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
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-xs">
                            {request.entityType.name.slice(0, 1).toUpperCase()}
                          </span>
                          <h3 className="truncate font-medium">{title}</h3>
                          <Badge
                            className={cn(
                              'px-2 py-0.5 text-[10px] uppercase tracking-wide border',
                              getRecordStatusBadgeClasses(request.status)
                            )}
                            variant="secondary"
                          >
                            {getRecordStatusLabel(request.status)}
                          </Badge>
                        </div>
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{description}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span>{request.entityType.name}</span>
                          <span>by {request.createdBy.name || request.createdBy.email}</span>
                          <span>
                            Step {request.workflowInstance?.currentStep ?? 0} of {stepsTotal}
                          </span>
                          <span>
                            {getNextActionLabel(
                              request.status,
                              assignedApproverNames.length > 0
                                ? assignedApproverNames.join(', ')
                                : (steps as Array<{ step?: number; role?: string }>).find((step) => step.step === currentStep)
                                    ?.role
                            )}
                          </span>
                        </div>
                        {overdueLabel ? (
                          <p className="mt-1 text-xs text-rose-200">{overdueLabel}</p>
                        ) : null}
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>{new Date(request.createdAt).toLocaleDateString()}</p>
                        <p className="mt-1">View</p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
