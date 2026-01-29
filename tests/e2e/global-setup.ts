import { execSync } from 'node:child_process';
import { prisma } from '../../lib/prisma';

export default async function globalSetup() {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  execSync('npx prisma db seed', { stdio: 'inherit' });

  await prisma.organization.updateMany({
    data: { subscriptionStatus: 'active' },
  });
  await prisma.$disconnect();
}
