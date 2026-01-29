import { isPendingApprovalStatus } from '@/lib/records/status';

type ApprovalInput = {
  recordStatus: string;
  workflowStatus: string;
  stepStatus: string;
  requiredRole?: string;
  assignedApproverIds: string[];
  userRole: string;
  userId: string;
  openBlockers: number;
};

export function getApprovalError(input: ApprovalInput): string | null {
  if (!isPendingApprovalStatus(input.recordStatus)) {
    return 'Record is not pending approval';
  }
  if (!isPendingApprovalStatus(input.workflowStatus)) {
    return 'Workflow is not pending approval';
  }
  if (input.stepStatus !== 'PENDING') {
    return 'Current step has already been resolved';
  }
  if (input.assignedApproverIds.length === 0) {
    return 'Approvers have not been assigned for this step';
  }
  if (!input.assignedApproverIds.includes(input.userId)) {
    return 'You are not assigned to this approval step';
  }
  if (input.requiredRole && input.requiredRole !== input.userRole) {
    return 'Insufficient permissions';
  }
  if (input.openBlockers > 0) {
    return 'Resolve open blockers before approving.';
  }
  return null;
}
