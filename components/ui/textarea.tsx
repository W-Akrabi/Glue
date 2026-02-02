import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
      className={cn(
        "flex min-h-[96px] w-full rounded-xl border border-[#E6E9F4] bg-white/90 px-4 py-2 text-sm text-[#1F2430] ring-offset-background placeholder:text-[#8A94A7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F6AFA]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
