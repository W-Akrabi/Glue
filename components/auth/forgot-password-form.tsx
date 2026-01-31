"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/actions/password-reset";

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, {});

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>

      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state?.success ? (
        <div className="text-sm text-emerald-300 space-y-2">
          <p>Check your email for the reset link.</p>
          {state?.link ? (
            <p className="break-all text-xs text-muted-foreground">
              Dev link: <a className="text-primary underline" href={state.link}>{state.link}</a>
            </p>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
