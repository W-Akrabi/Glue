import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import { approveRequest, rejectRequest } from '@/lib/actions/requests';
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
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
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
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Link href="/requests" className="text-indigo-600 hover:text-indigo-800 text-sm">
            ← Back to requests
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900" data-testid="request-title">
                  {request.title}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'APPROVED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                  data-testid="request-status"
                >
                  {request.status}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                  <p className="text-gray-600 whitespace-pre-wrap" data-testid="request-description">
                    {request.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Created By:</p>
                    <p className="text-gray-600">{request.createdBy.name}</p>
                    <p className="text-sm text-gray-500">{request.createdBy.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Created:</p>
                    <p className="text-gray-600">
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Approval Actions */}
            {canApprove && (
              <div className="bg-white rounded-lg shadow p-6" data-testid="approval-actions">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Take Action</h3>
                <p className="text-sm text-gray-600 mb-4">
                  You have permission to approve or reject this request at Step {request.currentStep}
                  (requires {currentStep?.requiredRole} role).
                </p>
                <div className="flex gap-4">
                  <form action={approveRequest.bind(null, request.id)}>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                      data-testid="approve-button"
                    >
                      ✓ Approve
                    </button>
                  </form>
                  <form action={rejectRequest.bind(null, request.id)}>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                      data-testid="reject-button"
                    >
                      ✗ Reject
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Audit Trail */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h3>
              <div className="space-y-4">
                {request.auditLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 text-sm" data-testid={`audit-log-${log.id}`}>
                    <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-gray-900">
                        <span className="font-medium">{log.actor.name}</span> {log.action.toLowerCase()} this request
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Approval Progress */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Progress</h3>
              <div className="space-y-4">
                {request.approvalSteps.map((step, index) => (
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
                      <p className="text-sm text-gray-600">{step.requiredRole} approval</p>
                      {step.approvedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(step.approvedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        step.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : step.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
