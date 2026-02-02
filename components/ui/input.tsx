import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-[#E6E9F4] bg-white/90 px-4 py-2 text-sm text-[#1F2430] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#8A94A7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F6AFA]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
