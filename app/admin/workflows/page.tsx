import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import WorkflowEditor from './workflow-editor';
import { prisma } from '@/lib/prisma';

export default async function AdminWorkflowsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const entityTypes = await prisma.entityType.findMany({
    where: { organizationId: session.user.organizationId! },
    include: { workflowDefinition: true },
    orderBy: { name: 'asc' },
  });

  const orgUsers = await prisma.user.findMany({
    where: { organizationId: session.user.organizationId! },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  });

  const primaryEntity = entityTypes[0];

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Glue</h1>
              <p className="text-sm text-gray-400">Admin workflows</p>
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
              href="/dashboard"
              className="px-3 py-4 text-sm font-medium text-gray-400 hover:text-white transition"
            >
              Dashboard
            </Link>
            <Link
              href="/requests"
              className="px-3 py-4 text-sm font-medium text-gray-400 hover:text-white transition"
            >
              Records
            </Link>
            <Link
              href="/admin/entity-types"
              className="px-3 py-4 text-sm font-medium text-gray-400 hover:text-white transition"
            >
              Entity Types
            </Link>
            <Link
              href="/admin/workflows"
              className="px-3 py-4 text-sm font-medium text-emerald-300 border-b-2 border-emerald-400"
            >
              Workflows
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-white/10 bg-neutral-900/70">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-xl font-semibold">Workflow definitions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Workflow steps are stored per entity type and applied to new records.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {entityTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Create an entity type before defining workflows.
              </p>
            ) : (
              <WorkflowEditor
                entityTypes={entityTypes.map((type) => ({
                  id: type.id,
                  name: type.name,
                  steps: type.workflowDefinition?.steps ?? [],
                }))}
                initialEntityTypeId={primaryEntity?.id}
                users={orgUsers}
              />
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
