'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

export async function updateProfile(
  _prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const name = String(formData.get('name') || '').trim();
  const avatarFile = formData.get('avatarFile') as File | null;

  if (name.length === 0) {
    return { error: 'Name is required.' };
  }

  let avatarUrl: string | undefined;
  if (avatarFile && avatarFile.size > 0) {
    if (!avatarFile.type.startsWith('image/')) {
      return { error: 'Avatar must be an image file.' };
    }
    const maxBytes = 5 * 1024 * 1024;
    if (avatarFile.size > maxBytes) {
      return { error: 'Avatar must be under 5MB.' };
    }
    const extensionMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
    };
    const extension = extensionMap[avatarFile.type];
    if (!extension) {
      return { error: 'Unsupported image format.' };
    }

    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    await mkdir(uploadDir, { recursive: true });
    const filename = `${session.user.id}-${Date.now()}.${extension}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    avatarUrl = `/uploads/avatars/${filename}`;
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        ...(avatarUrl ? { avatarUrl } : {}),
      },
    });
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { error: 'Failed to update profile.' };
  }
}

export async function updatePassword(
  _prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const currentPassword = String(formData.get('currentPassword') || '');
  const newPassword = String(formData.get('newPassword') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All password fields are required.' };
  }

  if (newPassword.length < 6) {
    return { error: 'New password must be at least 6 characters.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New password and confirmation do not match.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) {
      return { error: 'User not found.' };
    }

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return { error: 'Current password is incorrect.' };
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to update password:', error);
    return { error: 'Failed to update password.' };
  }
}
