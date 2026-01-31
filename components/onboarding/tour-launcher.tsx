"use client";

import { Button } from "@/components/ui/button";

const TOUR_EVENT = "glue-tour-start";

export default function TourLauncher() {
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => {
        window.dispatchEvent(new CustomEvent(TOUR_EVENT, { detail: { force: true } }));
      }}
    >
      Tour
    </Button>
  );
}
