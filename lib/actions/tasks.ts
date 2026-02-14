'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

type TaskState = {
  error?: string;
  success?: boolean;
};

export async function createTask(_prevState: TaskState, formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

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
        organizationId: session.user.organizationId!,
        createdById: session.user.id,
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
    return { error: 'Failed to create task' };
  }

  redirect('/tasks');
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const validStatuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'];
  if (!validStatuses.includes(newStatus)) {
    return { error: 'Invalid status' };
  }

  try {
    const task = await prisma.task.findFirst({
      where: { id: taskId, organizationId: session.user.organizationId! },
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
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

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
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  try {
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
