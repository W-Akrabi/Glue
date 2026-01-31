'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const TOKEN_TTL_MINUTES = 60;

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

function shouldExposeLink() {
  if (process.env.SHOW_RESET_LINK === 'true') return true;
  return process.env.NODE_ENV !== 'production';
}

function hashToken(raw: string) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export async function requestPasswordReset(
  _prevState: { error?: string; success?: boolean; link?: string },
  formData: FormData
) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  if (!email) {
    return { error: 'Email is required.' };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  // Always return success to avoid leaking emails.
  if (!user) {
    return { success: true };
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const link = `${getBaseUrl()}/reset-password?token=${rawToken}`;

  return shouldExposeLink() ? { success: true, link } : { success: true };
}

export async function resetPassword(
  _prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  const token = String(formData.get('token') || '').trim();
  const newPassword = String(formData.get('newPassword') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (!token) {
    return { error: 'Reset token is missing.' };
  }
  if (!newPassword || !confirmPassword) {
    return { error: 'All fields are required.' };
  }
  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }
  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findFirst({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.expiresAt < new Date()) {
    return { error: 'Reset link is invalid or expired.' };
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hashed },
    }),
    prisma.passwordResetToken.delete({ where: { id: record.id } }),
  ]);

  return { success: true };
}
