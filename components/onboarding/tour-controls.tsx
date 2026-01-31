"use client";

import { Button } from "@/components/ui/button";

const STORAGE_PREFIX = "glue:onboarding:v1";

function clearTourStorage() {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach((key) => localStorage.removeItem(key));
}

export default function TourControls() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        onClick={() => {
          clearTourStorage();
          window.location.href = "/dashboard";
        }}
      >
        Start full tour
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          clearTourStorage();
        }}
      >
        Reset tour progress
      </Button>
    </div>
  );
}
