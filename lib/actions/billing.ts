'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

type BillingState = {
  error?: string;
  success?: boolean;
};

export async function updateSubscription(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }
  if (session.user.role !== 'ADMIN') {
    return { error: 'Forbidden' };
  }

  const name = String(formData.get('cardName') || '').trim();
  const number = String(formData.get('cardNumber') || '').replace(/\s+/g, '');
  const brand = String(formData.get('cardBrand') || '').trim();

  if (!name || !number || number.length < 12) {
    return { error: 'Enter a valid card name and number.' };
  }

  const last4 = number.slice(-4);

  await prisma.organization.update({
    where: { id: session.user.organizationId },
    data: {
      subscriptionStatus: 'active',
      billingCardLast4: last4,
      billingCardBrand: brand || 'Card',
      billingUpdatedAt: new Date(),
    },
  });

  revalidatePath('/billing');
  revalidatePath('/dashboard');
  revalidatePath('/requests');

  return { success: true };
}
