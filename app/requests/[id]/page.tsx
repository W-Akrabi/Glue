import { auth, signOut } from '@/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { approveRequest, rejectRequest } from '@/lib/actions/requests';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { redirect } from 'next/navigation';

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

  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      createdBy: true,
      organization: true,
      approvalSteps: {
        orderBy: { stepNumber: 'asc' },
      },
      auditLogs: {
        include: { actor: true },
        orderBy: { timestamp: 'desc' },
      },
    },
  });

  if (!request) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Request not found.</p>
      </div>
    );
  }

  const currentStep = request.approvalSteps.find(
    (step) => step.stepNumber === request.currentStep
  );

  const canApprove =
    request.status === 'PENDING' &&
    currentStep &&
    (session.user.role === currentStep.requiredRole || session.user.role === 'ADMIN');

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
              All Requests
            </Link>
            <Link
              href="/requests/new"
              className="px-3 py-4 text-sm font-medium text-gray-400 hover:text-white transition"
            >
              New Request
            </Link>
            {session.user.role === 'ADMIN' && (
              <Link
                href="/admin/workflows"
                className="px-3 py-4 text-sm font-medium text-gray-400 hover:text-white transition"
              >
                Workflows
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Button variant="link" asChild>
            <Link href="/requests" className="text-sm">
              ← Back to requests
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <Card className="border-white/10 bg-neutral-900/70">
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <CardTitle className="text-2xl font-bold" data-testid="request-title">
                  {request.title}
                </CardTitle>
                <Badge
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border",
                    request.status === 'PENDING'
                      ? 'bg-amber-500/10 text-amber-200 border-amber-500/30'
                      : request.status === 'APPROVED'
                      ? 'bg-emerald-500/10 text-emerald-200 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-200 border-rose-500/30'
                  )}
                  data-testid="request-status"
                  variant="secondary"
                >
                  {request.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-1">Description:</p>
                  <p className="text-muted-foreground whitespace-pre-wrap" data-testid="request-description">
                    {request.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Created By:</p>
                    <p className="text-muted-foreground">{request.createdBy.name}</p>
                    <p className="text-sm text-muted-foreground">{request.createdBy.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">Created:</p>
                    <p className="text-muted-foreground">
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approval Actions */}
            {canApprove && (
              <Card data-testid="approval-actions" className="border-white/10 bg-neutral-900/70">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Take Action</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                  You have permission to approve or reject this request at Step {request.currentStep}
                  (requires {currentStep?.requiredRole} role).
                </p>
                <div className="flex gap-4">
                  <form action={approveRequest.bind(null, request.id)}>
                    <Button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black" data-testid="approve-button">
                      ✓ Approve
                    </Button>
                  </form>
                  <form action={rejectRequest.bind(null, request.id)}>
                    <Button type="submit" className="bg-rose-500 hover:bg-rose-400 text-black" data-testid="reject-button">
                      ✗ Reject
                    </Button>
                  </form>
                </div>
                </CardContent>
              </Card>
            )}

            {/* Audit Trail */}
            <Card className="border-white/10 bg-neutral-900/70">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Activity Log</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.auditLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 text-sm" data-testid={`audit-log-${log.id}`}>
                    <div className="flex-shrink-0 w-2 h-2 bg-emerald-400 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <p>
                        <span className="font-medium">{log.actor.name}</span> {log.action.toLowerCase()} this request
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
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
                {request.approvalSteps.map((step) => (
                  <div key={step.id} className="flex items-start gap-3" data-testid={`step-${step.stepNumber}`}>
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                        step.status === 'APPROVED'
                          ? 'bg-emerald-500/15 text-emerald-200'
                          : step.status === 'REJECTED'
                          ? 'bg-rose-500/15 text-rose-200'
                          : step.stepNumber === request.currentStep
                          ? 'bg-amber-500/15 text-amber-200'
                          : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {step.status === 'APPROVED' ? '✓' : step.status === 'REJECTED' ? '✗' : step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Step {step.stepNumber}</p>
                      <p className="text-sm text-muted-foreground">{step.requiredRole} approval</p>
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
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
