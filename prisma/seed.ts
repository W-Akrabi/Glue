import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Corp',
    },
  });

  console.log('✅ Created organization:', org.name);

  // Create default approval workflow steps for the organization
  await prisma.approvalWorkflowStep.createMany({
    data: [
      { organizationId: org.id, stepNumber: 1, requiredRole: 'APPROVER' },
      { organizationId: org.id, stepNumber: 2, requiredRole: 'ADMIN' },
    ],
  });

  console.log('✅ Created default approval workflow');

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create users with different roles
  const admin = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      organizationId: org.id,
    },
  });

  const approver = await prisma.user.create({
    data: {
      email: 'approver@acme.com',
      password: hashedPassword,
      name: 'Manager User',
      role: 'APPROVER',
      organizationId: org.id,
    },
  });

  const member = await prisma.user.create({
    data: {
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
  const request = await prisma.request.create({
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
  });

  // Create audit log
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

  console.log('✅ Created sample request:', request.title);
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
