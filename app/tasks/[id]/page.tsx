import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import AppShell from '@/components/layout/app-shell';
import TaskDetail from './task-detail';

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;

  const task = await prisma.task.findFirst({
    where: { id, organizationId: session.user.organizationId! },
    include: {
      assignee: { select: { id: true, name: true, email: true, role: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      record: {
        select: {
          id: true,
          data: true,
          status: true,
          entityType: { select: { name: true } },
        },
      },
      subtasks: {
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      parentTask: { select: { id: true, title: true } },
      blockedBy: {
        include: { blockingTask: { select: { id: true, title: true, status: true } } },
      },
      blocking: {
        include: { blockedTask: { select: { id: true, title: true, status: true } } },
      },
    },
  });

  if (!task) notFound();

  const users = await prisma.user.findMany({
    where: { organizationId: session.user.organizationId! },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  });

  const serializedTask = {
    ...task,
    dueAt: task.dueAt?.toISOString() ?? null,
    completedAt: task.completedAt?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    record: task.record
      ? {
          id: task.record.id,
          title: (task.record.data as Record<string, unknown>)?.title?.toString() ?? 'Untitled',
          status: task.record.status,
          entityType: task.record.entityType.name,
        }
      : null,
    subtasks: task.subtasks.map((s) => ({
      ...s,
      dueAt: s.dueAt?.toISOString() ?? null,
      completedAt: s.completedAt?.toISOString() ?? null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
    blockedBy: task.blockedBy.map((d) => d.blockingTask),
    blocking: task.blocking.map((d) => d.blockedTask),
  };

  return (
    <AppShell
      session={session}
      activeNav="tasks"
      headerTitle={task.title}
      headerSubtitle="Tasks / Detail"
      showRightRail={false}
    >
      <TaskDetail task={serializedTask} users={users} currentUserId={session.user.id} />
    </AppShell>
  );
}
