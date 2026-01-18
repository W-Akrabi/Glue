"use client";

import { useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/actions/signup";
import Link from "next/link";

export default function SignUpPage() {
  const [mode, setMode] = useState<"create" | "join">("join");
  const [state, formAction] = useFormState(signUp, {});

  const helperText = useMemo(
    () =>
      mode === "create"
        ? "Create a new organization and become its admin."
        : "Join an existing organization with an invite code.",
    [mode]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle>Create your account</CardTitle>
          <CardDescription>{helperText}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                className={`h-10 rounded-md border px-3 text-sm font-medium transition ${
                  mode === "join"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background text-foreground"
                }`}
                onClick={() => setMode("join")}
              >
                Join org
              </button>
              <button
                type="button"
                className={`h-10 rounded-md border px-3 text-sm font-medium transition ${
                  mode === "create"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background text-foreground"
                }`}
                onClick={() => setMode("create")}
              >
                Create org
              </button>
            </div>

            <input type="hidden" name="mode" value={mode} />

            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required placeholder="Jane Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="you@company.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required placeholder="••••••••" />
            </div>

            {mode === "create" ? (
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization name</Label>
                <Input id="orgName" name="orgName" required placeholder="Acme Inc." />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Invite code</Label>
                <Input id="inviteCode" name="inviteCode" required placeholder="ABCD-1234" />
              </div>
            )}

            {state?.error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {state.error}
              </div>
            )}

            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
