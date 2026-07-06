import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger" | "success";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-[var(--background)]",
          {
            "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]":
              variant === "default",
            "border border-[var(--border)] bg-transparent hover:bg-[var(--color-slate-100)] dark:hover:bg-[var(--color-slate-800)] text-[var(--foreground)]":
              variant === "outline",
            "hover:bg-[var(--color-slate-100)] dark:hover:bg-[var(--color-slate-800)] text-[var(--foreground)]":
              variant === "ghost",
            "bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-dark)]":
              variant === "danger",
            "bg-[var(--color-success)] text-white hover:bg-[var(--color-success-dark)]":
              variant === "success",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
