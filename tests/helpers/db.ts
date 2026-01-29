import { prisma } from '@/lib/prisma';

export async function resetDatabase() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "workflow_step_instances",
      "workflow_instances",
      "audit_logs",
      "comments",
      "notifications",
      "records",
      "workflow_definitions",
      "entity_types",
      "users",
      "organizations"
    RESTART IDENTITY CASCADE;
  `);
}
