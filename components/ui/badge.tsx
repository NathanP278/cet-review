import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "danger" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2",
        {
          "border-transparent bg-[var(--color-primary)] text-white": variant === "default",
          "border-transparent bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)] text-[var(--foreground)]":
            variant === "secondary",
          "text-[var(--foreground)] border-[var(--border)]": variant === "outline",
          "border-transparent bg-[var(--color-danger-light)]/20 text-[var(--color-danger-dark)] dark:text-[var(--color-danger-light)]":
            variant === "danger",
          "border-transparent bg-[var(--color-success-light)]/20 text-[var(--color-success-dark)] dark:text-[var(--color-success-light)]":
            variant === "success",
          "border-transparent bg-[var(--color-warning-light)]/20 text-[var(--color-warning-dark)] dark:text-[var(--color-warning-light)]":
            variant === "warning",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
