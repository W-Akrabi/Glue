import { auth } from '@/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import EntityTypeForm from './entity-type-form';
import AppShell from '@/components/layout/app-shell';

export default async function AdminEntityTypesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const entityTypes = await prisma.entityType.findMany({
    where: { organizationId: session.user.organizationId! },
    orderBy: { name: 'asc' },
  });

  return (
    <AppShell
      session={session}
      activeNav="admin-entity"
      headerTitle="Entity Types"
      headerSubtitle="Admin / Glue"
      topAction={{ label: 'Create', href: '/requests/new' }}
    >
      <div className="space-y-8">
        <Card className="border-white/10 bg-neutral-900/70">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Create entity type</CardTitle>
          </CardHeader>
          <CardContent>
            <EntityTypeForm />
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-neutral-900/70">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Existing entity types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entityTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No entity types yet.</p>
            ) : (
              entityTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{type.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {type.id}</p>
                  </div>
                  <Link
                    href="/admin/workflows"
                    className="text-xs text-emerald-300 hover:text-emerald-200"
                  >
                    Edit workflow
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
