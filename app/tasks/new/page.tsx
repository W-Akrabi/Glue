import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/app-shell';
import TaskForm from './task-form';

export default async function NewTaskPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const users = await prisma.user.findMany({
    where: { organizationId: session.user.organizationId! },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  });

  const records = await prisma.record.findMany({
    where: { organizationId: session.user.organizationId! },
    select: {
      id: true,
      data: true,
      entityType: { select: { name: true, schema: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const serializedRecords = records.map((r) => ({
    id: r.id,
    title: (r.data as Record<string, unknown>)?.title?.toString() || 'Untitled',
    entityType: r.entityType.name,
  }));

  const parentTasks = await prisma.task.findMany({
    where: { organizationId: session.user.organizationId!, parentTaskId: null },
    select: { id: true, title: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <AppShell
      session={session}
      activeNav="tasks"
      headerTitle="New Task"
      headerSubtitle="Tasks / Create"
      showRightRail={false}
    >
      <TaskForm users={users} records={serializedRecords} parentTasks={parentTasks} />
    </AppShell>
  );
}
