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
    permissions: { createRoles: ['MEMBER', 'ADMIN'] },
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
        { step: 1, role: 'MEMBER' },
        { step: 2, role: 'ADMIN' },
      ],
    },
    create: {
      entityTypeId: entityType.id,
      steps: [
        { step: 1, role: 'MEMBER' },
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
  console.log('  - Member:', member.email, '(password: password123)');

  await prisma.workflowDefinition.update({
    where: { entityTypeId: entityType.id },
    data: {
      steps: [
        { step: 1, role: 'MEMBER', approverIds: [member.id] },
        { step: 2, role: 'ADMIN', approverIds: [admin.id] },
      ],
    },
  });

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
        status: 'PENDING_APPROVAL',
        workflowInstance: {
          create: {
            currentStep: 1,
            status: 'PENDING_APPROVAL',
            steps: {
              create: steps.map((step: { step: number; role: string; approverIds?: string[] }) => ({
                stepNumber: step.step,
                status: 'PENDING',
                assignedApproverIds: step.approverIds ?? [],
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

  // Seed tasks linked to the approval record
  const existingTask = await prisma.task.findFirst({
    where: { organizationId: org.id, title: 'Implement laptop provisioning' },
  });

  if (!existingTask) {
    const implTask = await prisma.task.create({
      data: {
        title: 'Implement laptop provisioning',
        description: 'Set up the procurement process for 5 MacBook Pros as requested in the approval.',
        status: 'TODO',
        type: 'IMPLEMENTATION',
        priority: 'HIGH',
        organizationId: org.id,
        createdById: admin.id,
        assigneeId: member.id,
        recordId: request.id,
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        estimateHours: 8,
      },
    });

    await prisma.task.create({
      data: {
        title: 'Get vendor quotes for MacBook Pro',
        description: 'Contact at least 3 vendors for competitive pricing.',
        status: 'IN_PROGRESS',
        type: 'IMPLEMENTATION',
        priority: 'HIGH',
        organizationId: org.id,
        createdById: admin.id,
        assigneeId: member.id,
        parentTaskId: implTask.id,
        dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        estimateHours: 2,
      },
    });

    await prisma.task.create({
      data: {
        title: 'Prepare asset tracking spreadsheet',
        description: 'Create a spreadsheet to track laptop serial numbers, assigned users, and warranty info.',
        status: 'BACKLOG',
        type: 'DOCUMENTATION',
        priority: 'MEDIUM',
        organizationId: org.id,
        createdById: admin.id,
        assigneeId: member.id,
        parentTaskId: implTask.id,
        estimateHours: 1,
      },
    });

    const reviewTask = await prisma.task.create({
      data: {
        title: 'Review Q4 budget allocation',
        description: 'Ensure the laptop purchase aligns with Q4 departmental budget.',
        status: 'TODO',
        type: 'REVIEW',
        priority: 'URGENT',
        organizationId: org.id,
        createdById: member.id,
        assigneeId: admin.id,
        recordId: request.id,
        dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        estimateHours: 3,
      },
    });

    // Create dependency: impl task blocked by review task
    await prisma.taskDependency.create({
      data: {
        blockedTaskId: implTask.id,
        blockingTaskId: reviewTask.id,
      },
    });

    await prisma.task.create({
      data: {
        title: 'Update onboarding documentation',
        description: 'Add laptop setup instructions to the new hire onboarding guide.',
        status: 'BACKLOG',
        type: 'DOCUMENTATION',
        priority: 'LOW',
        organizationId: org.id,
        createdById: admin.id,
        estimateHours: 4,
      },
    });

    await prisma.task.create({
      data: {
        title: 'Configure MDM profiles',
        description: 'Set up Mobile Device Management profiles for the new laptops.',
        status: 'BLOCKED',
        type: 'IMPLEMENTATION',
        priority: 'MEDIUM',
        organizationId: org.id,
        createdById: admin.id,
        assigneeId: member.id,
        dueAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        estimateHours: 5,
      },
    });

    await prisma.task.create({
      data: {
        title: 'Schedule team laptop handoff meeting',
        description: 'Coordinate a meeting to distribute laptops and provide setup guidance.',
        status: 'BACKLOG',
        type: 'FOLLOW_UP',
        priority: 'MEDIUM',
        organizationId: org.id,
        createdById: member.id,
        assigneeId: admin.id,
        estimateHours: 1,
      },
    });

    console.log('✅ Created sample tasks linked to approval record');
  }
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
