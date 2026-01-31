import { auth } from '@/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { getEntitySchema, getRecordDescription, getRecordTitle, getWorkflowSteps } from '@/lib/records';
import { cn } from '@/lib/utils';
import {
  getNextActionLabel,
  getRecordStatusBadgeClasses,
  getRecordStatusLabel,
  isPendingApprovalStatus,
} from '@/lib/records/status';
import { getOverdueLabel } from '@/lib/records/sla';
import { resolveComment, unresolveComment } from '@/lib/actions/comments';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ApprovalActions from './approval-actions';
import CommentForm from './comment-form';
import ReplyForm from './reply-form';
import AppShell from '@/components/layout/app-shell';

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const request = await prisma.record.findUnique({
    where: { id },
    include: {
      createdBy: true,
      organization: true,
      entityType: { include: { workflowDefinition: true } },
      workflowInstance: {
        include: {
          steps: {
            orderBy: { stepNumber: 'asc' },
          },
        },
      },
    },
  });

  if (!request) {
    return (
      <AppShell
        session={session}
        activeNav="requests"
        headerTitle="Record"
        headerSubtitle="Projects / Glue"
        topAction={{ label: 'Create', href: '/requests/new' }}
        showRightRail={false}
      >
        <div className="min-h-[40vh] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Record not found.</p>
        </div>
      </AppShell>
    );
  }

  const orgUsers = await prisma.user.findMany({
    where: { organizationId: request.organizationId },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  });
  const orgUserMap = new Map(orgUsers.map((user) => [user.id, user]));

  const workflowSteps = getWorkflowSteps(request.entityType.workflowDefinition?.steps ?? []);
  const workflowMap = new Map(workflowSteps.map((step) => [step.step, step.role]));
  const currentStep = request.workflowInstance?.steps.find(
    (step) => step.stepNumber === request.workflowInstance?.currentStep
  );
  const currentApproverIds = Array.isArray(currentStep?.assignedApproverIds)
    ? currentStep?.assignedApproverIds.map((id) => String(id))
    : [];
  const currentApproverNames = currentApproverIds
    .map((id) => orgUserMap.get(id))
    .filter(Boolean)
    .map((user) => user?.name || user?.email);

  const requiredRole = workflowMap.get(request.workflowInstance?.currentStep || 0);
  const canApprove =
    isPendingApprovalStatus(request.status) &&
    currentStep &&
    requiredRole === session.user.role &&
    currentApproverIds.includes(session.user.id);
  const overdueLabel = getOverdueLabel(currentStep?.dueAt);

  const schema = getEntitySchema(request.entityType.schema);
  const data = request.data as Record<string, unknown>;
  const title = getRecordTitle(data, schema);
  const description = getRecordDescription(data, schema);

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      entityType: request.entityTypeId,
      entityId: request.id,
    },
    include: { actor: true },
    orderBy: { timestamp: 'desc' },
  });

  const comments = await prisma.comment.findMany({
    where: { recordId: request.id, parentId: null },
    include: {
      author: true,
      replies: { include: { author: true }, orderBy: { createdAt: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const openBlockers = comments.filter(
    (comment) => comment.type === 'BLOCKER' && !comment.resolvedAt
  ).length;

  const timelineItems = [
    ...auditLogs.map((log) => ({ type: 'audit' as const, createdAt: log.timestamp, log })),
    ...comments.map((comment) => ({ type: 'comment' as const, createdAt: comment.createdAt, comment })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <AppShell
      session={session}
      activeNav="requests"
      headerTitle={title}
      headerSubtitle="Projects / Glue"
      topAction={{ label: 'Create', href: '/requests/new' }}
      showRightRail={false}
    >
      <div className="mb-4">
        <Button variant="link" asChild>
          <Link href="/requests" className="text-sm">
            Back to records
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-white/10 bg-card/70">
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <CardTitle className="text-2xl font-bold" data-testid="request-title">
                {title}
              </CardTitle>
              <Badge
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium border',
                  getRecordStatusBadgeClasses(request.status)
                )}
                data-testid="request-status"
                variant="secondary"
              >
                {getRecordStatusLabel(request.status)}
              </Badge>
              <p className="mt-2 text-xs text-gray-400">
                {getNextActionLabel(
                  request.status,
                  currentApproverNames.length > 0 ? currentApproverNames.join(', ') : requiredRole
                )}
              </p>
              {overdueLabel ? <p className="mt-1 text-xs text-rose-200">{overdueLabel}</p> : null}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-300 mb-1">Description:</p>
                <p className="text-muted-foreground whitespace-pre-wrap" data-testid="request-description">
                  {description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-sm font-medium text-gray-300">Created By:</p>
                  <p className="text-muted-foreground">
                    {request.createdBy.name || request.createdBy.email}
                  </p>
                  <p className="text-sm text-muted-foreground">{request.createdBy.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Created:</p>
                  <p className="text-muted-foreground">
                    {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Type:</p>
                  <p className="text-muted-foreground">{request.entityType.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {canApprove ? (
            <ApprovalActions
              recordId={request.id}
              currentStep={request.workflowInstance?.currentStep ?? 0}
              requiredRole={requiredRole}
            />
          ) : null}

          <Card className="border-white/10 bg-card/70">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CommentForm recordId={request.id} />
              {openBlockers > 0 ? (
                <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                  {openBlockers} open blocker{openBlockers === 1 ? '' : 's'} need resolution before approval.
                </div>
              ) : null}
              <div className="space-y-5">
                {timelineItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activity yet.</p>
                ) : (
                  timelineItems.map((item) => {
                    if (item.type === 'comment') {
                      const mentionTokens = Array.isArray(item.comment.mentions)
                        ? item.comment.mentions.filter((mention) => typeof mention === 'string')
                        : [];
                      const canResolve =
                        session.user.role === 'ADMIN' || item.comment.authorId === session.user.id;
                      const typeLabel =
                        item.comment.type === 'QUESTION'
                          ? 'Question'
                          : item.comment.type === 'BLOCKER'
                          ? 'Blocker'
                          : 'Comment';
                      const typeBadgeClass =
                        item.comment.type === 'BLOCKER'
                          ? 'bg-rose-500/10 text-rose-200 border-rose-500/30'
                          : item.comment.type === 'QUESTION'
                          ? 'bg-amber-500/10 text-amber-200 border-amber-500/30'
                          : 'bg-slate-500/10 text-slate-200 border-slate-500/30';

                      return (
                        <div key={item.comment.id} className="flex gap-4 text-sm">
                          <div className="flex-shrink-0 w-2 h-2 bg-sky-300 rounded-full mt-1.5"></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p>
                                <span className="font-medium">
                                  {item.comment.author.name || item.comment.author.email}
                                </span>{' '}
                                commented
                              </p>
                              <Badge
                                className={`px-2 py-0.5 text-[10px] uppercase tracking-wide border ${typeBadgeClass}`}
                                variant="secondary"
                              >
                                {typeLabel}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(item.comment.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
                              {item.comment.body}
                            </p>
                            {mentionTokens.length > 0 ? (
                              <div className="flex flex-wrap gap-2 mt-2 text-xs text-emerald-200">
                                {mentionTokens.map((mention) => (
                                  <span key={mention} className="px-2 py-1 rounded-full bg-emerald-500/10">
                                    @{mention}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                            <div className="flex items-center gap-2 mt-3">
                              <ReplyForm recordId={request.id} parentId={item.comment.id} />
                              {item.comment.type === 'BLOCKER' && canResolve ? (
                                <form
                                  action={item.comment.resolvedAt ? unresolveComment : resolveComment}
                                  className="inline"
                                >
                                  <input type="hidden" name="commentId" value={item.comment.id} />
                                  <Button type="submit" variant="ghost" size="sm">
                                    {item.comment.resolvedAt ? 'Reopen' : 'Resolve'} blocker
                                  </Button>
                                </form>
                              ) : null}
                            </div>
                            {item.comment.replies.length > 0 ? (
                              <div className="mt-4 space-y-4">
                                {item.comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex gap-3">
                                    <div className="flex-shrink-0 w-1.5 h-1.5 bg-gray-500 rounded-full mt-1.5"></div>
                                    <div>
                                      <p className="text-sm">
                                        <span className="font-medium">
                                          {reply.author.name || reply.author.email}
                                        </span>{' '}
                                        <span className="text-xs text-gray-500">
                                          {new Date(reply.createdAt).toLocaleString()}
                                        </span>
                                      </p>
                                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                        {reply.body}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={item.log.id} className="flex gap-4 text-sm">
                        <div className="flex-shrink-0 w-2 h-2 bg-emerald-300 rounded-full mt-1.5"></div>
                        <div>
                          <p>
                            <span className="font-medium">{item.log.actor.name || item.log.actor.email}</span>{' '}
                            {item.log.action.toLowerCase()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(item.log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/10 bg-card/70">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Record metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Organization</p>
                <p>{request.organization.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current step</p>
                <p>
                  Step {request.workflowInstance?.currentStep ?? 0} of{' '}
                  {request.workflowInstance?.steps.length ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Approvers</p>
                <p>{currentApproverNames.length > 0 ? currentApproverNames.join(', ') : 'Unassigned'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
