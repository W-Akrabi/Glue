import { describe, expect, test } from 'vitest';
import { getApprovalError } from '@/lib/records/approval';

describe('getApprovalError', () => {
  test('allows approval when all checks pass', () => {
    const error = getApprovalError({
      recordStatus: 'PENDING_APPROVAL',
      workflowStatus: 'PENDING_APPROVAL',
      stepStatus: 'PENDING',
      requiredRole: 'ADMIN',
      assignedApproverIds: ['user-1'],
      userRole: 'ADMIN',
      userId: 'user-1',
      openBlockers: 0,
    });
    expect(error).toBeNull();
  });

  test('blocks approval if user not assigned', () => {
    const error = getApprovalError({
      recordStatus: 'PENDING_APPROVAL',
      workflowStatus: 'PENDING_APPROVAL',
      stepStatus: 'PENDING',
      requiredRole: 'ADMIN',
      assignedApproverIds: ['user-2'],
      userRole: 'ADMIN',
      userId: 'user-1',
      openBlockers: 0,
    });
    expect(error).toBe('You are not assigned to this approval step');
  });

  test('blocks approval when unresolved blockers exist', () => {
    const error = getApprovalError({
      recordStatus: 'PENDING_APPROVAL',
      workflowStatus: 'PENDING_APPROVAL',
      stepStatus: 'PENDING',
      requiredRole: 'ADMIN',
      assignedApproverIds: ['user-1'],
      userRole: 'ADMIN',
      userId: 'user-1',
      openBlockers: 2,
    });
    expect(error).toBe('Resolve open blockers before approving.');
  });
});
