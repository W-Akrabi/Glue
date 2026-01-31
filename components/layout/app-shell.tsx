import { Button } from '@/components/ui/button';
import InteractiveTour from '@/components/onboarding/interactive-tour';
import UserMenu from '@/components/layout/user-menu';
import Link from 'next/link';
import RightRail from './right-rail';
import { ReactNode } from 'react';
import {
  Building2,
  FilePlus2,
  Files,
  GitBranch,
  LayoutDashboard,
  Shapes,
} from 'lucide-react';

export type AppShellProps = {
  session: {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      avatarUrl?: string | null;
      role?: string | null;
      organizationId?: string | null;
    };
  };
  activeNav: 'dashboard' | 'requests' | 'org' | 'admin-entity' | 'admin-workflows' | 'settings';
  headerTitle: string;
  headerSubtitle?: string;
  topAction?: { label: string; href: string };
  search?: { name: string; value?: string; placeholder?: string };
  children: ReactNode;
  rightRail?: ReactNode;
  showRightRail?: boolean;
};

const navLinkBase = 'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition';

export default function AppShell({
  session,
  activeNav,
  headerTitle,
  headerSubtitle = 'Projects / Glue',
  topAction,
  search,
  children,
  rightRail,
  showRightRail = true,
}: AppShellProps) {
  const role = session.user.role || 'MEMBER';
  const organizationId = session.user.organizationId || '';

  return (
    <div className="min-h-screen bg-background text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-background/90 backdrop-blur">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-sky-400" />
            <div>
              <p className="text-sm text-gray-400">{headerSubtitle}</p>
              <h1 className="text-lg font-semibold">{headerTitle}</h1>
            </div>
          </div>

          {search ? (
            <div className="hidden flex-1 items-center gap-3 md:flex">
              <form method="get" className="relative w-full">
                <input
                  type="search"
                  name={search.name}
                  defaultValue={search.value}
                  placeholder={search.placeholder || 'Search'}
                  data-tour="header-search"
                  className="h-10 w-full rounded-full border border-white/10 bg-black/40 pl-10 pr-4 text-sm text-white placeholder:text-gray-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">⌕</span>
              </form>
            </div>
          ) : (
            <div className="hidden flex-1 md:block" />
          )}

          <div className="flex items-center gap-3">
            {topAction ? (
              <Button
                asChild
                size="sm"
                className="bg-emerald-400 text-black hover:bg-emerald-300"
                data-tour="header-create"
              >
                <Link href={topAction.href}>{topAction.label}</Link>
              </Button>
            ) : null}
            <UserMenu
              name={session.user.name}
              email={session.user.email}
              role={role}
              avatarUrl={session.user.avatarUrl}
            />
          </div>
        </div>
      </header>

      <div className="flex w-full gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 flex-col gap-3 rounded-2xl border border-white/10 bg-card p-4 lg:flex">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Workspace</p>
          <nav className="space-y-1 text-sm">
            <Link
              href="/dashboard"
              data-tour="nav-dashboard"
              className={`${navLinkBase} ${
                activeNav === 'dashboard'
                  ? 'bg-white/5 text-emerald-200'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/requests"
              data-tour="nav-records"
              className={`${navLinkBase} ${
                activeNav === 'requests'
                  ? 'bg-white/5 text-emerald-200'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Files className="h-4 w-4" />
              Records
            </Link>
            {role !== 'VIEWER' ? (
              <Link
                href="/requests/new"
                data-tour="nav-new-record"
                className={`${navLinkBase} text-gray-400 hover:bg-white/5 hover:text-white`}
              >
                <FilePlus2 className="h-4 w-4" />
                New Record
              </Link>
            ) : null}
            <Link
              href="/org-select"
              data-tour="nav-org"
              className={`${navLinkBase} ${
                activeNav === 'org' ? 'bg-white/5 text-emerald-200' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Organization
            </Link>
            {role === 'ADMIN' ? (
              <>
                <Link
                  href="/admin/entity-types"
                  data-tour="nav-entity-types"
                  className={`${navLinkBase} ${
                    activeNav === 'admin-entity'
                      ? 'bg-white/5 text-emerald-200'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Shapes className="h-4 w-4" />
                  Entity Types
                </Link>
                <Link
                  href="/admin/workflows"
                  data-tour="nav-workflows"
                  className={`${navLinkBase} ${
                    activeNav === 'admin-workflows'
                      ? 'bg-white/5 text-emerald-200'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <GitBranch className="h-4 w-4" />
                  Workflows
                </Link>
              </>
            ) : null}
          </nav>
          <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-gray-400">
            <p className="font-semibold text-gray-300">Need help?</p>
            <p className="mt-1">Define workflows and assign approvers to keep approvals moving.</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>

        {showRightRail
          ? rightRail ?? (
              <RightRail userId={session.user.id} organizationId={organizationId} role={role} />
            )
          : null}
      </div>
      <InteractiveTour role={role} />
    </div>
  );
}
