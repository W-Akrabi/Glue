import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import EntityTypeForm from './entity-type-form';

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
    <div className="min-h-screen bg-black text-white">
      <header className="bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Glue</h1>
              <p className="text-sm text-gray-400">Admin entity types</p>
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
            className="px-3 py-4 text-sm font-medium text-emerald-300 border-b-2 border-emerald-400"
          >
            Entity Types
          </Link>
          <Link
            href="/admin/workflows"
            className="px-3 py-4 text-sm font-medium text-gray-400 hover:text-white transition"
          >
            Workflows
          </Link>
        </div>
      </div>
    </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
                    Edit workflow →
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
