'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { requireActiveSubscription } from '@/lib/billing';
import { extractMentions } from '@/lib/records/comments';
import { getEntitySchema, getRecordTitle } from '@/lib/records';
import { revalidatePath } from 'next/cache';

type CommentState = {
  error?: string;
  success?: boolean;
};

function normalizeToken(value: string) {
  return value.replace(/\s+/g, '').toLowerCase();
}

export async function createComment(
  recordId: string,
  _prevState: CommentState,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }
  if (!(await requireActiveSubscription(session.user.organizationId))) {
    return { error: 'Subscription inactive. Add billing to continue.' };
  }

  const body = String(formData.get('body') || '').trim();
  if (!body) {
    return { error: 'Comment cannot be empty.' };
  }

  const parentId = String(formData.get('parentId') || '').trim() || null;
  const rawType = String(formData.get('type') || '').trim().toUpperCase();
  const type = rawType === 'QUESTION' || rawType === 'BLOCKER' ? rawType : 'COMMENT';

  const record = await prisma.record.findFirst({
    where: { id: recordId, organizationId: session.user.organizationId },
    include: { entityType: true },
  });
  if (!record) {
    return { error: 'Record not found.' };
  }

  if (parentId) {
    const parent = await prisma.comment.findFirst({
      where: { id: parentId, recordId },
      select: { id: true, parentId: true },
    });
    if (!parent) {
      return { error: 'Parent comment not found.' };
    }
    if (parent.parentId) {
      return { error: 'Replies are limited to one level.' };
    }
  }

  const tokens = extractMentions(body);
  let mentionUserIds: string[] = [];

  if (tokens.length > 0) {
    const orgUsers = await prisma.user.findMany({
      where: { organizationId: session.user.organizationId },
      select: { id: true, name: true, email: true },
    });
    const normalizedTokens = tokens.map((token) => normalizeToken(token));

    mentionUserIds = orgUsers
      .filter((user) => {
        const emailHandle = normalizeToken(user.email.split('@')[0] || '');
        const nameHandle = user.name ? normalizeToken(user.name) : '';
        return normalizedTokens.some((token) => token === emailHandle || (nameHandle && token === nameHandle));
      })
      .map((user) => user.id)
      .filter((userId) => userId !== session.user.id);
  }

  await prisma.comment.create({
    data: {
      recordId,
      authorId: session.user.id,
      body,
      type: parentId ? 'COMMENT' : type,
      parentId,
      mentions: tokens,
    },
  });

  if (mentionUserIds.length > 0) {
    const schema = getEntitySchema(record.entityType.schema);
    const title = getRecordTitle(record.data as Record<string, unknown>, schema);

    await prisma.notification.createMany({
      data: mentionUserIds.map((userId) => ({
        userId,
        recordId,
        title: 'You were mentioned',
        body: `You were mentioned on "${title}".`,
      })),
    });
  }

  revalidatePath(`/requests/${recordId}`);

  return { success: true };
}

export async function resolveComment(commentId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }
  if (!(await requireActiveSubscription(session.user.organizationId))) {
    return { error: 'Subscription inactive. Add billing to continue.' };
  }

  const comment = await prisma.comment.findFirst({
    where: { id: commentId, record: { organizationId: session.user.organizationId } },
    include: { record: true },
  });
  if (!comment) {
    return { error: 'Comment not found.' };
  }

  if (comment.authorId !== session.user.id && session.user.role !== 'ADMIN') {
    return { error: 'Not allowed to resolve this comment.' };
  }

  if (!comment.resolvedAt) {
    await prisma.comment.update({
      where: { id: commentId },
      data: { resolvedAt: new Date() },
    });
  }

  revalidatePath(`/requests/${comment.recordId}`);

  return { success: true };
}

export async function unresolveComment(commentId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }
  if (!(await requireActiveSubscription(session.user.organizationId))) {
    return { error: 'Subscription inactive. Add billing to continue.' };
  }

  const comment = await prisma.comment.findFirst({
    where: { id: commentId, record: { organizationId: session.user.organizationId } },
    include: { record: true },
  });
  if (!comment) {
    return { error: 'Comment not found.' };
  }

  if (comment.authorId !== session.user.id && session.user.role !== 'ADMIN') {
    return { error: 'Not allowed to reopen this comment.' };
  }

  if (comment.resolvedAt) {
    await prisma.comment.update({
      where: { id: commentId },
      data: { resolvedAt: null },
    });
  }

  revalidatePath(`/requests/${comment.recordId}`);

  return { success: true };
}
