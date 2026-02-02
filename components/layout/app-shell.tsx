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
    <div className="min-h-screen bg-[#F4F6FA] text-[#1F2430] dot-grid">
      <header className="sticky top-0 z-20 border-b border-[#E6E9F4] bg-white/80 backdrop-blur">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#4F6AFA] to-[#6B7CFF]" />
            <div>
              <p className="text-sm text-[#6B7280]">{headerSubtitle}</p>
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
                  className="h-10 w-full rounded-full border border-[#E6E9F4] bg-white/90 pl-10 pr-4 text-sm text-[#1F2430] placeholder:text-[#8A94A7]"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A94A7]">⌕</span>
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
                className="bg-gradient-to-r from-[#4F6AFA] to-[#6B7CFF] text-white hover:from-[#445DF2] hover:to-[#5F73FF] shadow-[0_10px_24px_rgba(79,106,250,0.25)]"
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
        <aside className="hidden w-56 shrink-0 flex-col gap-3 rounded-2xl border border-[#E6E9F4] bg-white/90 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] lg:flex">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Workspace</p>
          <nav className="space-y-1 text-sm">
            <Link
              href="/dashboard"
              data-tour="nav-dashboard"
              className={`${navLinkBase} ${
                activeNav === 'dashboard'
                  ? 'bg-[#EEF1FA] text-[#4F6AFA]'
                  : 'text-[#6B7280] hover:bg-[#EEF1FA] hover:text-[#1F2430]'
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
                  ? 'bg-[#EEF1FA] text-[#4F6AFA]'
                  : 'text-[#6B7280] hover:bg-[#EEF1FA] hover:text-[#1F2430]'
              }`}
            >
              <Files className="h-4 w-4" />
              Records
            </Link>
            {role !== 'VIEWER' ? (
              <Link
                href="/requests/new"
                data-tour="nav-new-record"
                className={`${navLinkBase} text-[#6B7280] hover:bg-[#EEF1FA] hover:text-[#1F2430]`}
              >
                <FilePlus2 className="h-4 w-4" />
                New Record
              </Link>
            ) : null}
            <Link
              href="/org-select"
              data-tour="nav-org"
              className={`${navLinkBase} ${
                activeNav === 'org'
                  ? 'bg-[#EEF1FA] text-[#4F6AFA]'
                  : 'text-[#6B7280] hover:bg-[#EEF1FA] hover:text-[#1F2430]'
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
                      ? 'bg-[#EEF1FA] text-[#4F6AFA]'
                      : 'text-[#6B7280] hover:bg-[#EEF1FA] hover:text-[#1F2430]'
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
                      ? 'bg-[#EEF1FA] text-[#4F6AFA]'
                      : 'text-[#6B7280] hover:bg-[#EEF1FA] hover:text-[#1F2430]'
                  }`}
                >
                  <GitBranch className="h-4 w-4" />
                  Workflows
                </Link>
              </>
            ) : null}
          </nav>
          <div className="mt-4 rounded-xl border border-[#E6E9F4] bg-[#F8F9FD] p-3 text-xs text-[#6B7280]">
            <p className="font-semibold text-[#1F2430]">Need help?</p>
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
