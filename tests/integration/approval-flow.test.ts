import { beforeEach, describe, expect, test, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { approveRecord } from '@/lib/actions/records';
import { resetDatabase } from '@/tests/helpers/db';

const authMock = vi.fn();
vi.mock('@/auth', () => ({
  auth: () => authMock(),
}));

describe('approval workflow integration', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  test('approves a record and advances workflow', async () => {
    const org = await prisma.organization.create({
      data: { name: 'Test Org', inviteCode: 'TEST-ORG', subscriptionStatus: 'active' },
    });
    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: 'password',
        name: 'Admin',
        role: 'ADMIN',
        organizationId: org.id,
      },
    });
    const member = await prisma.user.create({
      data: {
        email: 'member@test.com',
        password: 'password',
        name: 'Member',
        role: 'MEMBER',
        organizationId: org.id,
      },
    });
    const entityType = await prisma.entityType.create({
      data: {
        name: 'General Request',
        organizationId: org.id,
        schema: {
          titleField: 'title',
          descriptionField: 'description',
          fields: [
            { key: 'title', label: 'Title', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'textarea', required: true },
          ],
          permissions: { createRoles: ['MEMBER', 'ADMIN'] },
        },
      },
    });
    await prisma.workflowDefinition.create({
      data: {
        entityTypeId: entityType.id,
        steps: [
          { step: 1, role: 'MEMBER', approverIds: [member.id] },
          { step: 2, role: 'ADMIN', approverIds: [admin.id] },
        ],
      },
    });

    const record = await prisma.record.create({
      data: {
        data: { title: 'Test', description: 'Test record' },
        organizationId: org.id,
        createdById: member.id,
        entityTypeId: entityType.id,
        status: 'PENDING_APPROVAL',
        workflowInstance: {
          create: {
            currentStep: 1,
            status: 'PENDING_APPROVAL',
            steps: {
              create: [
                { stepNumber: 1, status: 'PENDING', assignedApproverIds: [member.id] },
                { stepNumber: 2, status: 'PENDING', assignedApproverIds: [admin.id] },
              ],
            },
          },
        },
      },
      include: { workflowInstance: { include: { steps: true } } },
    });

    authMock.mockResolvedValue({
      user: { id: member.id, role: 'MEMBER', organizationId: org.id, name: member.name },
    });

    const result = await approveRecord(record.id, {}, new FormData());
    expect(result).toEqual({ success: true });

    const updated = await prisma.record.findUnique({
      where: { id: record.id },
      include: { workflowInstance: { include: { steps: true } } },
    });

    expect(updated?.workflowInstance?.currentStep).toBe(2);
    expect(updated?.status).toBe('PENDING_APPROVAL');
    const step1 = updated?.workflowInstance?.steps.find((step) => step.stepNumber === 1);
    expect(step1?.status).toBe('APPROVED');
  });

  test('blocks approval when unresolved blocker exists', async () => {
    const org = await prisma.organization.create({
      data: { name: 'Blocker Org', inviteCode: 'BLOCK-ORG', subscriptionStatus: 'active' },
    });
    const user = await prisma.user.create({
      data: {
        email: 'user@blocker.com',
        password: 'password',
        name: 'User',
        role: 'ADMIN',
        organizationId: org.id,
      },
    });
    const entityType = await prisma.entityType.create({
      data: {
        name: 'Blocker Request',
        organizationId: org.id,
        schema: {
          titleField: 'title',
          descriptionField: 'description',
          fields: [
            { key: 'title', label: 'Title', type: 'text', required: true },
            { key: 'description', label: 'Description', type: 'textarea', required: true },
          ],
          permissions: { createRoles: ['ADMIN'] },
        },
      },
    });
    await prisma.workflowDefinition.create({
      data: {
        entityTypeId: entityType.id,
        steps: [{ step: 1, role: 'ADMIN', approverIds: [user.id] }],
      },
    });

    const record = await prisma.record.create({
      data: {
        data: { title: 'Blocked', description: 'Blocked record' },
        organizationId: org.id,
        createdById: user.id,
        entityTypeId: entityType.id,
        status: 'PENDING_APPROVAL',
        workflowInstance: {
          create: {
            currentStep: 1,
            status: 'PENDING_APPROVAL',
            steps: {
              create: [{ stepNumber: 1, status: 'PENDING', assignedApproverIds: [user.id] }],
            },
          },
        },
      },
    });

    await prisma.comment.create({
      data: {
        recordId: record.id,
        authorId: user.id,
        body: 'Blocking issue',
        type: 'BLOCKER',
      },
    });

    authMock.mockResolvedValue({
      user: { id: user.id, role: 'ADMIN', organizationId: org.id, name: user.name },
    });

    const result = await approveRecord(record.id, {}, new FormData());
    expect(result).toEqual({ error: 'Resolve open blockers before approving.' });
  });
});
