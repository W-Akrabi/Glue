'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function setOnboardingComplete(key: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingState: true },
    });
    const current = (user?.onboardingState as Record<string, boolean> | null) ?? {};
    const next = { ...current, [key]: true };

    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingState: next },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to update onboarding state:', error);
    return { error: 'Failed to update onboarding state' };
  }
}

export async function resetOnboarding() {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingState: {} },
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to reset onboarding state:', error);
    return { error: 'Failed to reset onboarding state' };
  }
}
