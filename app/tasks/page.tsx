import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/app-shell';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TaskBoard from './task-board';

type SearchParams = { [key: string]: string | string[] | undefined };

function getParam(sp: SearchParams | undefined, key: string) {
  const v = sp?.[key];
  return Array.isArray(v) ? v[0] : v;
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const resolvedSP =
    typeof (searchParams as Promise<SearchParams>)?.then === 'function'
      ? await (searchParams as Promise<SearchParams>)
      : (searchParams as SearchParams | undefined);
  const viewMode = getParam(resolvedSP, 'view') || 'board';

  const tasks = await prisma.task.findMany({
    where: { organizationId: session.user.organizationId! },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      record: { select: { id: true, data: true, entityType: { select: { name: true } } } },
      subtasks: { select: { id: true, title: true, status: true } },
      parentTask: { select: { id: true, title: true } },
      blockedBy: {
        include: { blockingTask: { select: { id: true, title: true, status: true } } },
      },
    },
    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
  });

  const users = await prisma.user.findMany({
    where: { organizationId: session.user.organizationId! },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  });

  const statusCounts = {
    BACKLOG: tasks.filter((t) => t.status === 'BACKLOG').length,
    TODO: tasks.filter((t) => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    BLOCKED: tasks.filter((t) => t.status === 'BLOCKED').length,
    DONE: tasks.filter((t) => t.status === 'DONE').length,
  };

  const serializedTasks = tasks.map((t) => ({
    ...t,
    dueAt: t.dueAt?.toISOString() ?? null,
    completedAt: t.completedAt?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    record: t.record
      ? {
          id: t.record.id,
          title:
            (t.record.data as Record<string, unknown>)?.title?.toString() ?? 'Untitled',
          entityType: t.record.entityType.name,
        }
      : null,
    subtasks: t.subtasks,
    parentTask: t.parentTask,
    blockedBy: t.blockedBy.map((d) => ({
      id: d.blockingTask.id,
      title: d.blockingTask.title,
      status: d.blockingTask.status,
    })),
  }));

  return (
    <AppShell
      session={session}
      activeNav="tasks"
      headerTitle="Tasks"
      headerSubtitle="Projects / Glue"
      topAction={{ label: 'New Task', href: '/tasks/new' }}
      showRightRail={false}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold" data-testid="tasks-heading">Tasks</h2>
            <p className="text-sm text-gray-500">
              Manage tasks linked to approvals and standalone work items.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tasks?view=board"
              data-testid="view-board-btn"
              className={`rounded-full border px-4 py-2 text-sm transition ${
                viewMode === 'board'
                  ? 'border-[#4F6AFA] text-[#4F6AFA] bg-[#4F6AFA]/10'
                  : 'border-[#E6E9F4] text-[#6B7280] hover:text-[#1F2430]'
              }`}
            >
              Board
            </Link>
            <Link
              href="/tasks?view=list"
              data-testid="view-list-btn"
              className={`rounded-full border px-4 py-2 text-sm transition ${
                viewMode === 'list'
                  ? 'border-[#4F6AFA] text-[#4F6AFA] bg-[#4F6AFA]/10'
                  : 'border-[#E6E9F4] text-[#6B7280] hover:text-[#1F2430]'
              }`}
            >
              List
            </Link>
            <Button asChild data-testid="create-task-button">
              <Link href="/tasks/new">+ New Task</Link>
            </Button>
          </div>
        </div>

        {/* Status summary pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[#E6E9F4] bg-white/80 px-4 py-2 text-xs text-[#1F2430] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-slate-400" /> Backlog {statusCounts.BACKLOG}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#E6E9F4] bg-white/80 px-4 py-2 text-xs text-[#1F2430] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-400" /> Todo {statusCounts.TODO}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#E6E9F4] bg-white/80 px-4 py-2 text-xs text-[#1F2430] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> In Progress {statusCounts.IN_PROGRESS}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#E6E9F4] bg-white/80 px-4 py-2 text-xs text-[#1F2430] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-rose-400" /> Blocked {statusCounts.BLOCKED}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#E6E9F4] bg-white/80 px-4 py-2 text-xs text-[#1F2430] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Done {statusCounts.DONE}
          </div>
        </div>

        {/* Board or List */}
        <TaskBoard
          tasks={serializedTasks}
          users={users}
          viewMode={viewMode}
          currentUserId={session.user.id}
          organizationId={session.user.organizationId!}
          userRole={session.user.role || 'MEMBER'}
        />
      </div>
    </AppShell>
  );
}
