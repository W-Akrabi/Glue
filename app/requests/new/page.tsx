import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import RecordForm from './record-form';

export default async function NewRequestPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { subscriptionStatus: true },
  });
  if (!org || org.subscriptionStatus !== 'active') {
    redirect('/billing');
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
              className="px-3 py-4 text-sm font-medium text-gray-400 hover:text-white transition"
            >
              Records
            </Link>
            <Link
              href="/requests/new"
              className="px-3 py-4 text-sm font-medium text-emerald-300 border-b-2 border-emerald-400"
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
            <Link
              href="/billing"
              className="px-3 py-4 text-sm font-medium text-gray-400 hover:text-white transition"
            >
              Billing
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
