const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function normalizeRole(role) {
  const normalized = String(role || '').toUpperCase();
  return normalized === 'APPROVER' ? 'MEMBER' : normalized;
}

async function main() {
  const definitions = await prisma.workflowDefinition.findMany({
    include: { entityType: true },
  });

  let updatedCount = 0;

  for (const definition of definitions) {
    const steps = Array.isArray(definition.steps) ? definition.steps : [];
    if (steps.length === 0) {
      continue;
    }

    const orgUsers = await prisma.user.findMany({
      where: { organizationId: definition.entityType.organizationId },
      select: { id: true, role: true },
    });

    const usersByRole = new Map();
    for (const user of orgUsers) {
      const role = normalizeRole(user.role);
      if (!usersByRole.has(role)) {
        usersByRole.set(role, []);
      }
      usersByRole.get(role).push(user.id);
    }

    let changed = false;
    const nextSteps = steps.map((step) => {
      const role = normalizeRole(step.role);
      const approverIds = Array.isArray(step.approverIds)
        ? step.approverIds.map((id) => String(id)).filter(Boolean)
        : [];
      if (approverIds.length > 0) {
        return { ...step, role, approverIds };
      }
      const fallback = usersByRole.get(role) || [];
      if (fallback.length === 0) {
        console.warn(
          `No users found for role ${role} in org ${definition.entityType.organizationId} (workflow ${definition.id}).`
        );
        return { ...step, role, approverIds: [] };
      }
      changed = true;
      return { ...step, role, approverIds: fallback };
    });

    if (changed) {
      await prisma.workflowDefinition.update({
        where: { id: definition.id },
        data: { steps: nextSteps },
      });
      updatedCount += 1;
    }
  }

  console.log(`Backfill complete. Updated ${updatedCount} workflow definitions.`);
}

main()
  .catch((error) => {
    console.error('Backfill failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
