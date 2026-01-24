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
import { getEntitySchema, getRecordDescription, getRecordTitle } from '@/lib/records';
import { cn } from '@/lib/utils';
import {
  getNextActionLabel,
  getRecordStatusBadgeClasses,
  getRecordStatusLabel,
} from '@/lib/records/status';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function RequestsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const requests = await prisma.record.findMany({
    where: { organizationId: session.user.organizationId! },
    include: {
      createdBy: { select: { name: true, email: true } },
      entityType: true,
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Records</h2>
          <Button asChild data-testid="create-request-button">
            <Link href="/requests/new">+ New Record</Link>
          </Button>
        </div>

        <div className="bg-neutral-900/70 border border-white/10 rounded-lg overflow-hidden">
          {requests.length === 0 ? (
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
                {requests.map((request) => {
                  const schema = getEntitySchema(request.entityType.schema);
                  const data = request.data as Record<string, unknown>;
                  const title = getRecordTitle(data, schema);
                  const description = getRecordDescription(data, schema);
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
                          "px-3 py-1 rounded-full text-xs font-medium border",
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
      </main>
    </div>
  );
}
