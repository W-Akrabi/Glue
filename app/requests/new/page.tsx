import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import RecordForm from './record-form';
import AppShell from '@/components/layout/app-shell';

export default async function NewRequestPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }
  if (session.user.role === 'VIEWER') {
    redirect('/requests');
  }

  const entityTypes = await prisma.entityType.findMany({
    where: { organizationId: session.user.organizationId! },
    include: { workflowDefinition: true },
    orderBy: { name: 'asc' },
  });

  return (
    <AppShell
      session={session}
      activeNav="requests"
      headerTitle="New Record"
      headerSubtitle="Projects / Glue"
      topAction={{ label: 'Create', href: '/requests/new' }}
    >
      <div className="max-w-3xl">
        <Card className="border-white/10 bg-neutral-900/70">
          <CardHeader>
            <CardTitle>Create New Record</CardTitle>
          </CardHeader>
          <CardContent>
            {entityTypes.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No entity types configured yet. Ask an admin to create one.
              </div>
            ) : (
              <RecordForm
                entityTypes={entityTypes.map((type) => ({
                  id: type.id,
                  name: type.name,
                  schema: type.schema,
                  workflowSteps: type.workflowDefinition?.steps ?? [],
                }))}
              />
            )}
            <div className="mt-6">
              <Button variant="link" asChild>
                <Link href="/requests">Back to records</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
