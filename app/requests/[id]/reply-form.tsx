'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { createComment } from '@/lib/actions/comments';

type ReplyFormProps = {
  recordId: string;
  parentId: string;
};

type ReplyState = { error?: string; success?: boolean };

export default function ReplyForm({ recordId, parentId }: ReplyFormProps) {
  const [state, formAction, pending] = useActionState<ReplyState, FormData>(
    createComment.bind(null, recordId),
    {}
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="parentId" value={parentId} />
      <textarea
        name="body"
        disabled={pending}
        className="min-h-[72px] w-full rounded-md border border-white/10 bg-card/50 px-3 py-2 text-sm text-white"
        placeholder="Reply..."
      />
      {state?.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
      <Button type="submit" variant="ghost" size="sm" disabled={pending}>
        {pending ? 'Replying…' : 'Reply'}
      </Button>
    </form>
  );
}
