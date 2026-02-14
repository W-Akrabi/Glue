'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

type TaskState = {
  error?: string;
  success?: boolean;
};

async function getDbUserFromSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' as const };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, organizationId: true },
  });

  if (!user) {
    return {
      error:
        'Session is out of sync with the current database. Please sign out and sign in again.',
    } as const;
  }

  return { user } as const;
}

export async function createTask(_prevState: TaskState, formData: FormData) {
  const userResult = await getDbUserFromSession();
  if ('error' in userResult) {
    return { error: userResult.error };
  }
  const { user } = userResult;

  const title = String(formData.get('title') || '').trim();
  if (!title) {
    return { error: 'Title is required' };
  }

  const description = String(formData.get('description') || '').trim() || null;
  const type = String(formData.get('type') || 'OTHER');
  const priority = String(formData.get('priority') || 'MEDIUM');
  const status = String(formData.get('status') || 'BACKLOG');
  const assigneeId = String(formData.get('assigneeId') || '').trim() || null;
  const recordId = String(formData.get('recordId') || '').trim() || null;
  const parentTaskId = String(formData.get('parentTaskId') || '').trim() || null;
  const dueAtRaw = String(formData.get('dueAt') || '').trim();
  const estimateRaw = String(formData.get('estimateHours') || '').trim();

  const dueAt = dueAtRaw ? new Date(dueAtRaw) : null;
  const estimateHours = estimateRaw ? parseFloat(estimateRaw) : null;

  try {
    await prisma.task.create({
      data: {
        title,
        description,
        type: type as 'IMPLEMENTATION' | 'REVIEW' | 'DOCUMENTATION' | 'FOLLOW_UP' | 'OTHER',
        priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        status: status as 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE',
        organizationId: user.organizationId,
        createdById: user.id,
        assigneeId,
        recordId,
        parentTaskId,
        dueAt,
        estimateHours,
      },
    });

    revalidatePath('/tasks');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Failed to create task:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return {
        error:
          'Task references data that does not exist in this database. Please refresh and try again.',
      };
    }
    return { error: 'Failed to create task' };
  }

  redirect('/tasks');
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
  const userResult = await getDbUserFromSession();
  if ('error' in userResult) {
    return { error: userResult.error };
  }
  const { user } = userResult;

  const validStatuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'];
  if (!validStatuses.includes(newStatus)) {
    return { error: 'Invalid status' };
  }

  try {
    const task = await prisma.task.findFirst({
      where: { id: taskId, organizationId: user.organizationId },
    });

    if (!task) {
      return { error: 'Task not found' };
    }

    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: newStatus as 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE',
        completedAt: newStatus === 'DONE' ? new Date() : null,
      },
    });

    revalidatePath('/tasks');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to update task status:', error);
    return { error: 'Failed to update status' };
  }
}

export async function updateTask(taskId: string, _prevState: TaskState, formData: FormData) {
  const userResult = await getDbUserFromSession();
  if ('error' in userResult) {
    return { error: userResult.error };
  }
  const { user } = userResult;

  const title = String(formData.get('title') || '').trim();
  if (!title) {
    return { error: 'Title is required' };
  }

  const description = String(formData.get('description') || '').trim() || null;
  const type = String(formData.get('type') || 'OTHER');
  const priority = String(formData.get('priority') || 'MEDIUM');
  const assigneeId = String(formData.get('assigneeId') || '').trim() || null;
  const dueAtRaw = String(formData.get('dueAt') || '').trim();
  const estimateRaw = String(formData.get('estimateHours') || '').trim();

  const dueAt = dueAtRaw ? new Date(dueAtRaw) : null;
  const estimateHours = estimateRaw ? parseFloat(estimateRaw) : null;

  try {
    const task = await prisma.task.findFirst({
      where: { id: taskId, organizationId: user.organizationId },
      select: { id: true },
    });
    if (!task) {
      return { error: 'Task not found' };
    }

    await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        type: type as 'IMPLEMENTATION' | 'REVIEW' | 'DOCUMENTATION' | 'FOLLOW_UP' | 'OTHER',
        priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        assigneeId,
        dueAt,
        estimateHours,
      },
    });

    revalidatePath('/tasks');
    revalidatePath(`/tasks/${taskId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update task:', error);
    return { error: 'Failed to update task' };
  }
}

export async function deleteTask(taskId: string) {
  const userResult = await getDbUserFromSession();
  if ('error' in userResult) {
    return { error: userResult.error };
  }
  const { user } = userResult;

  try {
    const task = await prisma.task.findFirst({
      where: { id: taskId, organizationId: user.organizationId },
      select: { id: true },
    });
    if (!task) {
      return { error: 'Task not found' };
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    revalidatePath('/tasks');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete task:', error);
    return { error: 'Failed to delete task' };
  }
}
