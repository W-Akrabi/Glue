import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function OrgSelectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const organization = await prisma.organization.findUnique({
    where: { id: session.user.organizationId! },
  });

  if (!organization) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="max-w-md w-full border-white/10 bg-neutral-900/80">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Organization not found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your account is missing an organization assignment.
            </p>
            <Button asChild>
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Glue</h1>
              <p className="text-sm text-gray-400">Select an organization</p>
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
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card className="border-white/10 bg-neutral-900/70">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Available organizations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border border-white/10 rounded-lg p-4 flex items-center justify-between bg-black/40">
              <div>
                <p className="text-sm text-muted-foreground">Organization</p>
                <p className="text-lg font-medium">{organization.name}</p>
                {session.user.role === 'ADMIN' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Invite code: <span className="font-medium">{organization.inviteCode}</span>
                  </p>
                )}
              </div>
              <Button asChild>
                <Link href="/dashboard">Continue</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              This build currently supports a single organization per user.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
