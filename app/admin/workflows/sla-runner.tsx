"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { runSlaCheck } from "@/lib/actions/sla";

type ActionState = { error?: string; success?: boolean; notified?: number; escalated?: number };

export default function SlaRunner() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(runSlaCheck, {});

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <Button type="submit" disabled={pending}>
        {pending ? "Running SLA check..." : "Run SLA check"}
      </Button>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state?.success ? (
        <p className="text-sm text-emerald-300">
          Notifications sent: {state.notified ?? 0}. Escalations: {state.escalated ?? 0}.
        </p>
      ) : null}
    </form>
  );
}
