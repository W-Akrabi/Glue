import { auth } from '@/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { prisma } from '@/lib/prisma';
import { getEntitySchema, getRecordDescription, getRecordTitle } from '@/lib/records';
import { cn } from '@/lib/utils';
import {
  getNextActionLabel,
  getRecordStatusBadgeClasses,
  getRecordStatusLabel,
} from '@/lib/records/status';
import { getOverdueLabel } from '@/lib/records/sla';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/app-shell';

type SearchParams = { [key: string]: string | string[] | undefined };

type EnrichedRecord = Awaited<ReturnType<typeof prisma.record.findMany>>[number] & {
  _title: string;
  _description: string;
};

function getParam(searchParams: SearchParams | undefined, key: string) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function RequestsPage({
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
  const statusFilter = getParam(resolvedSearchParams, 'status') || 'all';
  const entityTypeFilter = getParam(resolvedSearchParams, 'entityType') || 'all';
  const viewFilter = getParam(resolvedSearchParams, 'view') || 'all';

  const baseWhere: Record<string, unknown> = {
    organizationId: session.user.organizationId!,
  };
  if (statusFilter !== 'all') {
    baseWhere.status = statusFilter;
  }
  if (entityTypeFilter !== 'all') {
    baseWhere.entityTypeId = entityTypeFilter;
  }

  const requests = await prisma.record.findMany({
    where: baseWhere,
    include: {
      createdBy: { select: { name: true, email: true } },
      entityType: { include: { workflowDefinition: true } },
      workflowInstance: {
        include: { steps: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const orgUsers = await prisma.user.findMany({
    where: { organizationId: session.user.organizationId! },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });
  const orgUserMap = new Map(orgUsers.map((user) => [user.id, user]));

  const entityTypes = await prisma.entityType.findMany({
    where: { organizationId: session.user.organizationId! },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  const enrichedRequests: EnrichedRecord[] = requests.map((request) => {
    const schema = getEntitySchema(request.entityType.schema);
    const data = request.data as Record<string, unknown>;
    const title = getRecordTitle(data, schema);
    const description = getRecordDescription(data, schema);
    return { ...request, _title: title, _description: description } as EnrichedRecord;
  });

  const currentUserId = session.user.id;
  const requiresMyApproval = (request: EnrichedRecord) => {
    const currentStepNumber = request.workflowInstance?.currentStep;
    if (!currentStepNumber || !request.workflowInstance?.steps?.length) {
      return false;
    }
    const currentStep = request.workflowInstance.steps.find(
      (step) => step.stepNumber === currentStepNumber
    );
    const assignedApproverIds = Array.isArray(currentStep?.assignedApproverIds)
      ? currentStep?.assignedApproverIds.map((id) => String(id))
      : [];
    return (
      request.status === 'PENDING_APPROVAL' &&
      currentStep?.status === 'PENDING' &&
      assignedApproverIds.includes(currentUserId)
    );
  };

  const searchedRequests = query
    ? enrichedRequests.filter((request) => {
        const haystacks = [
          request._title,
          request._description,
          request.entityType.name,
          request.createdBy.name || '',
          request.createdBy.email || '',
        ]
          .join(' ')
          .toLowerCase();
        return haystacks.includes(query);
      })
    : enrichedRequests;

  const counts = {
    all: searchedRequests.length,
    assigned: searchedRequests.filter(requiresMyApproval).length,
    created: searchedRequests.filter((request) => request.createdById === currentUserId).length,
    related: searchedRequests.filter(
      (request) => request.createdById === currentUserId || requiresMyApproval(request)
    ).length,
  };

  const filteredRequests = searchedRequests.filter((request) => {
    if (viewFilter === 'assigned') {
      return requiresMyApproval(request);
    }
    if (viewFilter === 'created') {
      return request.createdById === currentUserId;
    }
    if (viewFilter === 'related') {
      return request.createdById === currentUserId || requiresMyApproval(request);
    }
    return true;
  });

  const statusOptions = Array.from(new Set(requests.map((request) => request.status))).sort();

  const buildQuery = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    const view = overrides.view ?? viewFilter;
    const status = overrides.status ?? statusFilter;
    const entityType = overrides.entityType ?? entityTypeFilter;
    const q = overrides.q ?? query;

    if (view && view !== 'all') params.set('view', view);
    if (status && status !== 'all') params.set('status', status);
    if (entityType && entityType !== 'all') params.set('entityType', entityType);
    if (q) params.set('q', q);

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  return (
    <AppShell
      session={session}
      activeNav="requests"
      headerTitle="Records"
      headerSubtitle="Projects / Glue"
      topAction={{ label: 'Create', href: '/requests/new' }}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Records</h2>
            <p className="text-sm text-gray-500">
              Track approvals you need to action and the records you submitted.
            </p>
          </div>
          <Button asChild data-testid="create-request-button" data-tour="requests-create">
            <Link href="/requests/new">+ New Record</Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/requests${buildQuery({ view: 'all' })}`}
            className={cn(
              'rounded-full border px-4 py-2 text-sm transition',
              viewFilter === 'all'
                ? 'border-emerald-400 text-emerald-200 bg-emerald-400/10'
                : 'border-white/10 text-gray-400 hover:text-white'
            )}
          >
            All ({counts.all})
          </Link>
          <Link
            href={`/requests${buildQuery({ view: 'assigned' })}`}
            className={cn(
              'rounded-full border px-4 py-2 text-sm transition',
              viewFilter === 'assigned'
                ? 'border-emerald-400 text-emerald-200 bg-emerald-400/10'
                : 'border-white/10 text-gray-400 hover:text-white'
            )}
          >
            Needs my approval ({counts.assigned})
          </Link>
          <Link
            href={`/requests${buildQuery({ view: 'created' })}`}
            className={cn(
              'rounded-full border px-4 py-2 text-sm transition',
              viewFilter === 'created'
                ? 'border-emerald-400 text-emerald-200 bg-emerald-400/10'
                : 'border-white/10 text-gray-400 hover:text-white'
            )}
          >
            Created by me ({counts.created})
          </Link>
          <Link
            href={`/requests${buildQuery({ view: 'related' })}`}
            className={cn(
              'rounded-full border px-4 py-2 text-sm transition',
              viewFilter === 'related'
                ? 'border-emerald-400 text-emerald-200 bg-emerald-400/10'
                : 'border-white/10 text-gray-400 hover:text-white'
            )}
          >
            Related to me ({counts.related})
          </Link>
        </div>

        <form method="get" className="flex flex-wrap items-center gap-3" data-tour="requests-filters">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search titles, descriptions, people, entity types..."
            className="h-10 min-w-[220px] flex-1 rounded-md border border-white/10 bg-black px-3 text-sm text-white"
          />
          <select
            name="status"
            defaultValue={statusFilter}
            className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm text-white"
          >
            <option value="all">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            name="entityType"
            defaultValue={entityTypeFilter}
            className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm text-white"
          >
            <option value="all">All entity types</option>
            {entityTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <input type="hidden" name="view" value={viewFilter} />
          <Button type="submit" variant="secondary">
            Apply
          </Button>
          <Link href="/requests" className="text-sm text-gray-400 hover:text-white">
            Clear
          </Link>
        </form>

        <div
          className="bg-neutral-900/70 border border-white/10 rounded-lg overflow-hidden"
          data-tour="requests-table"
        >
          {filteredRequests.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              <p className="mb-4">No records found</p>
              <Link href="/requests/new" className="text-primary hover:underline">
                Create your first record
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => {
                  const title = request._title;
                  const description = request._description;
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
                  const requiredRole = steps.find(
                    (step: { step?: number; role?: string }) =>
                      step.step === request.workflowInstance?.currentStep
                  )?.role;

                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="text-sm font-medium">{title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {description}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {request.entityType.name}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{request.createdBy.name || request.createdBy.email}</div>
                        <div className="text-xs text-muted-foreground">{request.createdBy.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium border',
                            getRecordStatusBadgeClasses(request.status)
                          )}
                          variant="secondary"
                        >
                          {getRecordStatusLabel(request.status)}
                        </Badge>
                        <p className="mt-1 text-xs text-gray-400">
                          {getNextActionLabel(
                            request.status,
                            assignedApproverNames.length > 0
                              ? assignedApproverNames.join(', ')
                              : requiredRole
                          )}
                        </p>
                        {overdueLabel ? (
                          <p className="mt-1 text-xs text-rose-200">{overdueLabel}</p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        Step {request.workflowInstance?.currentStep ?? 0} of {stepsTotal}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        <Button variant="link" asChild>
                          <Link href={`/requests/${request.id}`} data-testid={`view-request-${request.id}`}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
