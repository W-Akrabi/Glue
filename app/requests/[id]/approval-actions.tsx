'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { approveRecord, rejectRecord } from '@/lib/actions/records';

type ApprovalActionsProps = {
  recordId: string;
  currentStep: number;
  requiredRole?: string;
};

type ActionState = { error?: string; success?: boolean };

export default function ApprovalActions({
  recordId,
  currentStep,
  requiredRole,
}: ApprovalActionsProps) {
  const [approveState, approveAction, approvePending] = useActionState<ActionState, FormData>(
    approveRecord.bind(null, recordId),
    {}
  );
  const [rejectState, rejectAction, rejectPending] = useActionState<ActionState, FormData>(
    rejectRecord.bind(null, recordId),
    {}
  );

  return (
    <Card
      data-testid="approval-actions"
      className="border-[#E6E9F4] bg-white/90"
      data-tour="approval-actions"
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Take Action</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          You are assigned to approve Step {currentStep}
          {requiredRole ? ` (role ${requiredRole}).` : "."}
        </p>
        <form action={approveAction} className="space-y-3">
          <label className="block text-xs text-gray-400">
            Comment (optional). Use @mentions to tag teammates.
          </label>
          <textarea
            name="comment"
            disabled={approvePending}
            className="min-h-[88px] w-full rounded-md border border-[#E6E9F4] bg-white/90 px-3 py-2 text-sm text-white"
            placeholder="Add context for approval..."
          />
          {approveState?.error ? (
            <p className="text-sm text-destructive">{approveState.error}</p>
          ) : null}
          <Button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-black"
            data-testid="approve-button"
            disabled={approvePending}
          >
            {approvePending ? 'Approving…' : '✓ Approve'}
          </Button>
        </form>

        <form action={rejectAction} className="space-y-3">
          <label className="block text-xs text-gray-400">
            Comment (required). Use @mentions to tag teammates.
          </label>
          <textarea
            name="comment"
            required
            disabled={rejectPending}
            className="min-h-[88px] w-full rounded-md border border-[#E6E9F4] bg-white/90 px-3 py-2 text-sm text-white"
            placeholder="Explain why you are rejecting..."
          />
          {rejectState?.error ? (
            <p className="text-sm text-destructive">{rejectState.error}</p>
          ) : null}
          <Button
            type="submit"
            className="bg-rose-500 hover:bg-rose-400 text-black"
            data-testid="reject-button"
            disabled={rejectPending}
          >
            {rejectPending ? 'Rejecting…' : '✗ Reject'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
