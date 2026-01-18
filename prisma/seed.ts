import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  // Create or reuse organization
  const orgName = 'Acme Corp';
  const orgInviteCode = 'ACME-1234';
  let org = await prisma.organization.findFirst({
    where: { name: orgName },
  });
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: orgName,
        inviteCode: orgInviteCode,
      },
    });
  } else if (!org.inviteCode) {
    org = await prisma.organization.update({
      where: { id: org.id },
      data: { inviteCode: orgInviteCode },
    });
  }

  console.log('✅ Using organization:', org.name);

  const defaultSchema = {
    titleField: 'title',
    descriptionField: 'description',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
    ],
    permissions: { createRoles: ['MEMBER', 'APPROVER', 'ADMIN'] },
  };

  const entityType = await prisma.entityType.upsert({
    where: {
      organizationId_name: {
        organizationId: org.id,
        name: 'General Request',
      },
    },
    update: { schema: defaultSchema },
    create: {
      name: 'General Request',
      organizationId: org.id,
      schema: defaultSchema,
    },
  });

  await prisma.workflowDefinition.upsert({
    where: { entityTypeId: entityType.id },
    update: {
      steps: [
        { step: 1, role: 'APPROVER' },
        { step: 2, role: 'ADMIN' },
      ],
    },
    create: {
      entityTypeId: entityType.id,
      steps: [
        { step: 1, role: 'APPROVER' },
        { step: 2, role: 'ADMIN' },
      ],
    },
  });

  console.log('✅ Ensured default entity type and workflow definition');

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

  const workflowSteps = await prisma.workflowDefinition.findUnique({
    where: { entityTypeId: entityType.id },
  });

  const steps = Array.isArray(workflowSteps?.steps) ? workflowSteps!.steps : [];

  // Create sample record with workflow instance
  const existingRequest = await prisma.record.findFirst({
    where: {
      organizationId: org.id,
      createdById: member.id,
      entityTypeId: entityType.id,
    },
  });

  const request =
    existingRequest ||
    (await prisma.record.create({
      data: {
        data: {
          title: 'Purchase new laptops',
          description: 'Need to purchase 5 new MacBook Pros for the development team',
        },
        organizationId: org.id,
        createdById: member.id,
        entityTypeId: entityType.id,
        workflowInstance: {
          create: {
            currentStep: 1,
            status: 'PENDING',
            steps: {
              create: steps.map((step: { step: number; role: string }) => ({
                stepNumber: step.step,
                status: 'PENDING',
              })),
            },
          },
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
      entityType: entityType.id,
      entityId: request.id,
      action: 'CREATED',
      actorId: member.id,
      metadata: { entityTypeName: entityType.name },
    },
  });
}

  console.log('✅ Ensured sample record:', request.id);
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
