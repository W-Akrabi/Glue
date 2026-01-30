import { auth } from '@/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import WorkflowEditor from './workflow-editor';
import SlaRunner from './sla-runner';
import AppShell from '@/components/layout/app-shell';

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
    <AppShell
      session={session}
      activeNav="admin-workflows"
      headerTitle="Workflows"
      headerSubtitle="Admin / Glue"
      topAction={{ label: 'Create', href: '/requests/new' }}
    >
      <div className="space-y-8">
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

        <Card className="border-white/10 bg-neutral-900/70">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">SLA tracking</CardTitle>
            <p className="text-sm text-muted-foreground">
              Run SLA checks on demand to send overdue reminders and escalate assignments.
            </p>
          </CardHeader>
          <CardContent>
            <SlaRunner />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
