import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminWorkflowsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const workflowSteps = await prisma.approvalWorkflowStep.findMany({
    where: { organizationId: session.user.organizationId! },
    orderBy: { stepNumber: 'asc' },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Glue</h1>
              <p className="text-sm text-gray-600">Admin workflows</p>
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
              className="px-3 py-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              All Requests
            </Link>
            <Link
              href="/admin/workflows"
              className="px-3 py-4 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600"
            >
              Workflows
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Default request workflow</h2>
              <p className="text-sm text-gray-600">
                Workflow steps are stored per organization and applied to new requests.
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 text-sm text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
            >
              Edit workflow
            </button>
          </div>

          {workflowSteps.length === 0 ? (
            <div className="border rounded-lg p-4 text-sm text-gray-600">
              No workflow steps configured for this organization.
            </div>
          ) : (
            <div className="space-y-4">
              {workflowSteps.map((step) => (
                <div key={step.id} className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">Step {step.stepNumber}</p>
                  <p className="text-lg font-medium text-gray-900">
                    {step.requiredRole} approval
                  </p>
                  <p className="text-sm text-gray-600">
                    Required role: {step.requiredRole}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
