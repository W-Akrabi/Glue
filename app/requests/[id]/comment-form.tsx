'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { createComment } from '@/lib/actions/comments';

type CommentFormProps = {
  recordId: string;
};

type CommentState = { error?: string; success?: boolean };

export default function CommentForm({ recordId }: CommentFormProps) {
  const [state, formAction, pending] = useActionState<CommentState, FormData>(
    createComment.bind(null, recordId),
    {}
  );

  return (
    <form action={formAction} className="space-y-3">
      <label className="block text-xs text-gray-400">
        Add a comment. Use @mentions to tag teammates.
      </label>
      <div className="flex flex-wrap gap-2 text-xs">
        <label className="flex items-center gap-2 text-gray-300">
          <input type="radio" name="type" value="COMMENT" defaultChecked disabled={pending} />
          Comment
        </label>
        <label className="flex items-center gap-2 text-gray-300">
          <input type="radio" name="type" value="QUESTION" disabled={pending} />
          Question
        </label>
        <label className="flex items-center gap-2 text-rose-200">
          <input type="radio" name="type" value="BLOCKER" disabled={pending} />
          Blocker
        </label>
      </div>
      <textarea
        name="body"
        disabled={pending}
        className="min-h-[96px] w-full rounded-md border border-white/10 bg-card/60 px-3 py-2 text-sm text-white"
        placeholder="Share context, questions, or decisions..."
      />
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button
        type="submit"
        className="bg-emerald-500 hover:bg-emerald-400 text-black"
        disabled={pending}
      >
        {pending ? 'Posting…' : 'Post Comment'}
      </Button>
    </form>
  );
}
