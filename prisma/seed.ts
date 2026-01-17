import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  // Create or reuse organization
  const orgName = 'Acme Corp';
  let org = await prisma.organization.findFirst({
    where: { name: orgName },
  });
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: orgName,
      },
    });
  }

  console.log('✅ Using organization:', org.name);

  // Create default approval workflow steps for the organization
  const workflowStepsInput = [
    { organizationId: org.id, stepNumber: 1, requiredRole: 'APPROVER' },
    { organizationId: org.id, stepNumber: 2, requiredRole: 'ADMIN' },
  ];
  for (const step of workflowStepsInput) {
    await prisma.approvalWorkflowStep.upsert({
      where: {
        organizationId_stepNumber: {
          organizationId: step.organizationId,
          stepNumber: step.stepNumber,
        },
      },
      update: { requiredRole: step.requiredRole },
      create: step,
    });
  }

  console.log('✅ Ensured default approval workflow');

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create users with different roles
  const admin = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      organizationId: org.id,
    },
    create: {
      email: 'admin@acme.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      organizationId: org.id,
    },
  });

  const approver = await prisma.user.upsert({
    where: { email: 'approver@acme.com' },
    update: {
      password: hashedPassword,
      name: 'Manager User',
      role: 'APPROVER',
      organizationId: org.id,
    },
    create: {
      email: 'approver@acme.com',
      password: hashedPassword,
      name: 'Manager User',
      role: 'APPROVER',
      organizationId: org.id,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@acme.com' },
    update: {
      password: hashedPassword,
      name: 'Team Member',
      role: 'MEMBER',
      organizationId: org.id,
    },
    create: {
      email: 'member@acme.com',
      password: hashedPassword,
      name: 'Team Member',
      role: 'MEMBER',
      organizationId: org.id,
    },
  });

  console.log('✅ Created users:');
  console.log('  - Admin:', admin.email, '(password: password123)');
  console.log('  - Approver:', approver.email, '(password: password123)');
  console.log('  - Member:', member.email, '(password: password123)');

  const workflowSteps = await prisma.approvalWorkflowStep.findMany({
    where: { organizationId: org.id },
    orderBy: { stepNumber: 'asc' },
  });

  // Create sample request with approval steps
  const existingRequest = await prisma.request.findFirst({
    where: {
      organizationId: org.id,
      createdById: member.id,
      title: 'Purchase new laptops',
    },
  });

  const request =
    existingRequest ||
    (await prisma.request.create({
      data: {
        title: 'Purchase new laptops',
        description: 'Need to purchase 5 new MacBook Pros for the development team',
        organizationId: org.id,
        createdById: member.id,
        approvalSteps: {
          create: workflowSteps.map((step) => ({
            stepNumber: step.stepNumber,
            requiredRole: step.requiredRole,
            status: 'PENDING',
          })),
        },
      },
    }));

  // Create audit log if it doesn't exist
  const existingAudit = await prisma.auditLog.findFirst({
    where: {
      entityType: 'REQUEST',
      entityId: request.id,
      action: 'CREATED',
      actorId: member.id,
    },
  });
  if (!existingAudit) {
    await prisma.auditLog.create({
      data: {
        entityType: 'REQUEST',
        entityId: request.id,
        action: 'CREATED',
        actorId: member.id,
        requestId: request.id,
        metadata: JSON.stringify({ title: request.title }),
      },
    });
  }

  console.log('✅ Ensured sample request:', request.title);
  console.log('\n🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
