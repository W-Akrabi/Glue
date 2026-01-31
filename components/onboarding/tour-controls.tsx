"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { resetOnboarding } from "@/lib/actions/onboarding";

export default function TourControls() {
  const [pending, setPending] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        onClick={async () => {
          setPending(true);
          await resetOnboarding();
          window.location.href = "/dashboard";
        }}
        disabled={pending}
      >
        {pending ? "Starting…" : "Start full tour"}
      </Button>
      <Button
        variant="outline"
        onClick={async () => {
          setPending(true);
          await resetOnboarding();
          setPending(false);
        }}
        disabled={pending}
      >
        Reset tour progress
      </Button>
    </div>
  );
}
