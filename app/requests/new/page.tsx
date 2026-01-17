import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createRequest } from '@/lib/actions/requests';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function NewRequestPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const workflowSteps = await prisma.approvalWorkflowStep.findMany({
    where: { organizationId: session.user.organizationId! },
    orderBy: { stepNumber: 'asc' },
  });

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
              className="px-3 py-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              All Requests
            </Link>
            <Link
              href="/requests/new"
              className="px-3 py-4 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600"
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createRequest} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  required
                  placeholder="e.g., Purchase new laptops"
                  data-testid="title-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  rows={6}
                  placeholder="Provide detailed information about your request..."
                  data-testid="description-input"
                />
              </div>

              <div className="rounded-lg border bg-blue-50 p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">Approval Workflow:</p>
                {workflowSteps.length === 0 ? (
                  <p className="text-sm text-blue-700">No workflow steps configured.</p>
                ) : (
                  <ol className="text-sm text-blue-700 space-y-1 ml-4 list-decimal">
                    {workflowSteps.map((step) => (
                      <li key={step.id}>
                        Step {step.stepNumber}: {step.requiredRole} approval
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" data-testid="submit-request-button">
                  Submit Request
                </Button>
                <Button variant="secondary" asChild className="flex-1" data-testid="cancel-button">
                  <Link href="/requests">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
