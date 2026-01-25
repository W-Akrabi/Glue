import { prisma } from '@/lib/prisma';

export async function getOrgSubscriptionStatus(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      subscriptionStatus: true,
      planPriceCents: true,
      planCurrency: true,
      billingCardLast4: true,
      billingCardBrand: true,
    },
  });
  return org;
}

export async function requireActiveSubscription(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { subscriptionStatus: true },
  });
  if (!org || org.subscriptionStatus !== 'active') {
    return false;
  }
  return true;
}
