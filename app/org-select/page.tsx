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
          <Card className="border-white/10 bg-card/80">
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

  const [members, recordCounts, entityTypes] = await prisma.$transaction([
    prisma.user.findMany({
      where: { organizationId: organization.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { name: 'asc' },
    }),
    prisma.record.groupBy({
      by: ['createdById'],
      where: { organizationId: organization.id },
      _count: { _all: true },
    }),
    prisma.entityType.findMany({
      where: { organizationId: organization.id },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const entityTypeMap = new Map(entityTypes.map((entityType) => [entityType.id, entityType.name]));
  const recordCountMap = new Map(recordCounts.map((row) => [row.createdById, row._count._all]));

  const activityLogs = entityTypes.length
    ? await prisma.auditLog.findMany({
        where: { entityType: { in: entityTypes.map((entityType) => entityType.id) } },
        include: { actor: true },
        orderBy: { timestamp: 'desc' },
        take: 10,
      })
    : [];

  return (
    <AppShell
      session={session}
      activeNav="org"
      headerTitle="Organization"
      headerSubtitle="Projects / Glue"
      topAction={{ label: 'Create', href: '/requests/new' }}
    >
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className="border-white/10 bg-card/70" data-tour="org-team">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Organization overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Organization</p>
                  <p className="text-2xl font-semibold">{organization.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created{' '}
                    {new Date(organization.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <Button asChild>
                  <Link href="/dashboard">Continue</Link>
                </Button>
              </div>

              {session.user.role === 'ADMIN' ? (
                <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Invite code</p>
                  <p className="mt-2 text-lg font-semibold text-primary">{organization.inviteCode}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share this code to add teammates to your org.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/70" data-tour="org-activity">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Team directory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members found.</p>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/10 bg-card/40 p-4"
                    >
                      <div>
                        <p className="text-sm font-medium">{member.name || member.email}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
                        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-400">
                          {member.role}
                        </span>
                        <span>
                          Records created:{' '}
                          <span className="text-white">{recordCountMap.get(member.id) || 0}</span>
                        </span>
                        <span>
                          Joined{' '}
                          {new Date(member.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/70" data-tour="org-billing">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activityLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity yet.</p>
              ) : (
                activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/10 bg-card/40 p-4"
                  >
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">
                          {log.actor.name || log.actor.email}
                        </span>{' '}
                        <span className="text-muted-foreground">did</span>{' '}
                        <span className="font-medium">{log.action.toLowerCase()}</span>{' '}
                        <span className="text-muted-foreground">on</span>{' '}
                        {entityTypeMap.get(log.entityType) || 'record'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Record ID: <span className="text-gray-300">{log.entityId}</span>
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/10 bg-card/70">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Billing & plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-card/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Plan status</p>
                <p className="mt-2 text-sm font-medium capitalize">{organization.subscriptionStatus}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {organization.planCurrency} {(organization.planPriceCents / 100).toFixed(2)} / month
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-card/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Billing method</p>
                {organization.billingCardLast4 ? (
                  <>
                    <p className="mt-2 text-sm font-medium">
                      {organization.billingCardBrand} •••• {organization.billingCardLast4}
                    </p>
                    {organization.billingUpdatedAt ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated{' '}
                        {new Date(organization.billingUpdatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">No card on file</p>
                )}
              </div>

              <div className="grid gap-3">
                <Button className="w-full bg-emerald-400 text-black hover:bg-emerald-300" disabled>
                  Upgrade plan (coming soon)
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  Update billing method
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  View invoices
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Billing controls will unlock once payments are enabled for your org.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
