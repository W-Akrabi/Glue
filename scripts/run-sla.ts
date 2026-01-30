import { prisma } from '../lib/prisma';
import { runSlaCheckJob } from '../lib/sla';

async function main() {
  const result = await runSlaCheckJob();
  console.log(`SLA check complete. Checked: ${result.checked}. Notified: ${result.notified}. Escalated: ${result.escalated}.`);
}

main()
  .catch((error) => {
    console.error('SLA check failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
