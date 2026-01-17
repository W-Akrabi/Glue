import { auth, signOut } from '@/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const stats = await prisma.request.groupBy({
    by: ['status'],
    where: { organizationId: session.user.organizationId! },
    _count: true,
  });

  const pendingCount = stats.find((s) => s.status === 'PENDING')?._count || 0;
  const approvedCount = stats.find((s) => s.status === 'APPROVED')?._count || 0;
  const rejectedCount = stats.find((s) => s.status === 'REJECTED')?._count || 0;

  const recentRequests = await prisma.request.findMany({
    where: { organizationId: session.user.organizationId! },
    include: {
      createdBy: { select: { name: true, email: true } },
      approvalSteps: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const canApprove = session.user.role === 'APPROVER' || session.user.role === 'ADMIN';

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
                <Button type="submit" variant="ghost" size="sm" data-testid="logout-button">
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
              data-testid="nav-org-select"
            >
              Organization
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-4 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600"
              data-testid="nav-dashboard"
            >
              Dashboard
            </Link>
            <Link
              href="/requests"
              className="px-3 py-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
              data-testid="nav-requests"
            >
              All Requests
            </Link>
            <Link
              href="/requests/new"
              className="px-3 py-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
              data-testid="nav-new-request"
            >
              New Request
            </Link>
            {session.user.role === 'ADMIN' && (
              <Link
                href="/admin/workflows"
                className="px-3 py-4 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                data-testid="nav-admin-workflows"
              >
                Workflows
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card data-testid="stat-pending">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-approved">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{approvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-rejected">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{rejectedCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✗</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card>
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
          </div>
          <div className="divide-y">
            {recentRequests.length === 0 ? (
              <div className="px-6 py-12 text-center text-muted-foreground">
                No requests yet.{" "}
                <Link href="/requests/new" className="text-primary hover:underline">
                  Create one
                </Link>
              </div>
            ) : (
              recentRequests.map((request) => (
                <Link
                  key={request.id}
                  href={`/requests/${request.id}`}
                  className="block px-6 py-4 hover:bg-muted/40 transition"
                  data-testid={`request-${request.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{request.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">
                          by {request.createdBy.name || request.createdBy.email}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Step {request.currentStep} of {request.approvalSteps.length}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        request.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800 border-transparent"
                          : request.status === "APPROVED"
                          ? "bg-green-100 text-green-800 border-transparent"
                          : "bg-red-100 text-red-800 border-transparent"
                      )}
                      data-testid={`status-${request.id}`}
                      variant="secondary"
                    >
                      {request.status}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
