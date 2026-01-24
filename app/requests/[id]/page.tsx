import { auth, signOut } from '@/auth';
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
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ApprovalActions from './approval-actions';

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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Record not found.</p>
      </div>
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
                <Button type="submit" variant="ghost" size="sm">
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
            >
              Organization
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-4 text-sm font-medium text-gray-400 hover:text-white transition"
            >
              Dashboard
            </Link>
            <Link
              href="/requests"
              className="px-3 py-4 text-sm font-medium text-emerald-300 border-b-2 border-emerald-400"
            >
              Records
            </Link>
            <Link
              href="/requests/new"
              className="px-3 py-4 text-sm font-medium text-gray-400 hover:text-white transition"
            >
              New Record
            </Link>
            {session.user.role === 'ADMIN' && (
              <>
                <Link
                  href="/admin/entity-types"
                  className="px-3 py-4 text-sm font-medium text-gray-400 hover:text-white transition"
                >
                  Entity Types
                </Link>
                <Link
                  href="/admin/workflows"
                  className="px-3 py-4 text-sm font-medium text-gray-400 hover:text-white transition"
                >
                  Workflows
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Button variant="link" asChild>
            <Link href="/requests" className="text-sm">
              ← Back to records
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Record Details */}
            <Card className="border-white/10 bg-neutral-900/70">
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <CardTitle className="text-2xl font-bold" data-testid="request-title">
                  {title}
                </CardTitle>
                <Badge
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border",
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
                    currentApproverNames.length > 0
                      ? currentApproverNames.join(', ')
                      : requiredRole
                  )}
                </p>
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
                    <p className="text-muted-foreground">{request.createdBy.name || request.createdBy.email}</p>
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

            {/* Approval Actions */}
            {canApprove ? (
              <ApprovalActions
                recordId={request.id}
                currentStep={request.workflowInstance?.currentStep ?? 0}
                requiredRole={requiredRole}
              />
            ) : null}

            {/* Audit Trail */}
            <Card className="border-white/10 bg-neutral-900/70">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Activity Log</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {auditLogs.map((log) => {
                  const metadata = (log.metadata ?? {}) as Record<string, unknown>;
                  const comment = typeof metadata.comment === 'string' ? metadata.comment : '';
                  const mentions = Array.isArray(metadata.mentions)
                    ? metadata.mentions.filter((mention) => typeof mention === 'string')
                    : [];
                  return (
                    <div key={log.id} className="flex gap-4 text-sm" data-testid={`audit-log-${log.id}`}>
                      <div className="flex-shrink-0 w-2 h-2 bg-emerald-400 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p>
                          <span className="font-medium">{log.actor.name}</span> {log.action.toLowerCase()} this request
                        </p>
                        {comment ? <p className="mt-1 text-sm text-gray-200">{comment}</p> : null}
                        {mentions.length > 0 ? (
                          <p className="mt-1 text-xs text-gray-400">
                            Mentions: {mentions.map((mention) => `@${mention}`).join(', ')}
                          </p>
                        ) : null}
                        <p className="text-muted-foreground text-xs mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Approval Progress */}
            <Card className="border-white/10 bg-neutral-900/70">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Approval Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.workflowInstance?.steps.length ? (
                  request.workflowInstance.steps.map((step) => (
                    <div key={step.id} className="flex items-start gap-3" data-testid={`step-${step.stepNumber}`}>
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                          step.status === 'APPROVED'
                            ? 'bg-emerald-500/15 text-emerald-200'
                            : step.status === 'REJECTED'
                            ? 'bg-rose-500/15 text-rose-200'
                            : step.stepNumber === request.workflowInstance?.currentStep
                            ? 'bg-amber-500/15 text-amber-200'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        {step.status === 'APPROVED' ? '✓' : step.status === 'REJECTED' ? '✗' : step.stepNumber}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Step {step.stepNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {workflowMap.get(step.stepNumber) || 'UNKNOWN'} approval
                        </p>
                        {Array.isArray(step.assignedApproverIds) && step.assignedApproverIds.length > 0 ? (
                          <p className="text-xs text-muted-foreground mt-1">
                            Assigned to{" "}
                            {step.assignedApproverIds
                              .map((id) => orgUserMap.get(String(id)))
                              .filter(Boolean)
                              .map((user) => user?.name || user?.email)
                              .join(", ")}
                          </p>
                        ) : (
                          <p className="text-xs text-amber-200/80 mt-1">Approver unassigned</p>
                        )}
                        {step.approvedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(step.approvedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium border",
                          step.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-200 border-emerald-500/30'
                            : step.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-200 border-rose-500/30'
                            : 'bg-white/10 text-gray-300 border-white/10'
                        )}
                        variant="secondary"
                      >
                        {step.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No workflow steps configured.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
