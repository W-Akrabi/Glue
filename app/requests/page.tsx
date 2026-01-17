import { auth, signOut } from '@/auth';
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
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function RequestsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const requests = await prisma.request.findMany({
    where: { organizationId: session.user.organizationId! },
    include: {
      createdBy: { select: { name: true, email: true } },
      approvalSteps: true,
    },
    orderBy: { createdAt: 'desc' },
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Requests</h2>
          <Button asChild data-testid="create-request-button">
            <Link href="/requests/new">+ New Request</Link>
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {requests.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              <p className="mb-4">No requests found</p>
              <Link href="/requests/new" className="text-primary hover:underline">
                Create your first request
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">{request.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {request.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{request.createdBy.name}</div>
                      <div className="text-xs text-muted-foreground">{request.createdBy.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          request.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800 border-transparent"
                            : request.status === "APPROVED"
                            ? "bg-green-100 text-green-800 border-transparent"
                            : "bg-red-100 text-red-800 border-transparent"
                        )}
                        variant="secondary"
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      Step {request.currentStep} of {request.approvalSteps.length}
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
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}
