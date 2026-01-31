import { auth } from '@/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/app-shell';
import TourControls from '@/components/onboarding/tour-controls';
import ProfileForm from '@/components/settings/profile-form';
import PasswordForm from '@/components/settings/password-form';
import ThemeToggle from '@/components/theme/theme-toggle';

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organization: true },
  });

  if (!user) {
    redirect('/login');
  }

  return (
    <AppShell
      session={session}
      activeNav="settings"
      headerTitle="Settings"
      headerSubtitle="Account / Glue"
    >
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="border-white/10 bg-neutral-900/70">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProfileForm name={user.name} email={user.email} avatarUrl={user.avatarUrl} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-gray-500">Role</label>
                <div className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm">
                  {user.role}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-gray-500">Organization</label>
                <div className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm">
                  {user.organization?.name || '—'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/10 bg-neutral-900/70">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <PasswordForm />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-neutral-900/70">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Interactive tour</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Restart the guided walkthrough anytime.
              </p>
              <TourControls />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-neutral-900/70">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Switch between light and dark.</p>
              <ThemeToggle label />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
