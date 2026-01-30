import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/app-shell';

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
      <AppShell
        session={session}
        activeNav="org"
        headerTitle="Organization"
        headerSubtitle="Projects / Glue"
        topAction={{ label: 'Create', href: '/requests/new' }}
      >
        <div className="max-w-md">
          <Card className="border-white/10 bg-neutral-900/80">
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
      </AppShell>
    );
  }

  return (
    <AppShell
      session={session}
      activeNav="org"
      headerTitle="Organization"
      headerSubtitle="Projects / Glue"
      topAction={{ label: 'Create', href: '/requests/new' }}
    >
      <div className="max-w-5xl">
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
      </div>
    </AppShell>
  );
}
