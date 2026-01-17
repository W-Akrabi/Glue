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
    return <div>Request not found</div>;
  }

  const currentStep = request.approvalSteps.find(
    (step) => step.stepNumber === request.currentStep
  );

  const canApprove =
    request.status === 'PENDING' &&
    currentStep &&
    (session.user.role === currentStep.requiredRole || session.user.role === 'ADMIN');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Glue</h1>
              <p className="text-sm text-gray-600">Internal Tools</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
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

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <Link
              href="/org-select"
              className="px-3 py-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Organization
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/requests"
              className="px-3 py-4 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600"
            >
              All Requests
            </Link>
            <Link
              href="/requests/new"
              className="px-3 py-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              New Request
            </Link>
            {session.user.role === 'ADMIN' && (
              <Link
                href="/admin/workflows"
                className="px-3 py-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
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
            <Card>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <CardTitle className="text-2xl font-bold" data-testid="request-title">
                  {request.title}
                </CardTitle>
                <Badge
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    request.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800 border-transparent'
                      : request.status === 'APPROVED'
                      ? 'bg-green-100 text-green-800 border-transparent'
                      : 'bg-red-100 text-red-800 border-transparent'
                  )}
                  data-testid="request-status"
                  variant="secondary"
                >
                  {request.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                  <p className="text-muted-foreground whitespace-pre-wrap" data-testid="request-description">
                    {request.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Created By:</p>
                    <p className="text-muted-foreground">{request.createdBy.name}</p>
                    <p className="text-sm text-muted-foreground">{request.createdBy.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Created:</p>
                    <p className="text-muted-foreground">
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approval Actions */}
            {canApprove && (
              <Card data-testid="approval-actions">
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
                    <Button type="submit" className="bg-green-600 hover:bg-green-700" data-testid="approve-button">
                      ✓ Approve
                    </Button>
                  </form>
                  <form action={rejectRequest.bind(null, request.id)}>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700" data-testid="reject-button">
                      ✗ Reject
                    </Button>
                  </form>
                </div>
                </CardContent>
              </Card>
            )}

            {/* Audit Trail */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Activity Log</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.auditLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 text-sm" data-testid={`audit-log-${log.id}`}>
                    <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-gray-900">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Approval Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.approvalSteps.map((step) => (
                  <div key={step.id} className="flex items-start gap-3" data-testid={`step-${step.stepNumber}`}>
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                        step.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : step.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : step.stepNumber === request.currentStep
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {step.status === 'APPROVED' ? '✓' : step.status === 'REJECTED' ? '✗' : step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Step {step.stepNumber}</p>
                      <p className="text-sm text-muted-foreground">{step.requiredRole} approval</p>
                      {step.approvedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(step.approvedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Badge
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        step.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700 border-transparent'
                          : step.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700 border-transparent'
                          : 'bg-gray-100 text-gray-600 border-transparent'
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
