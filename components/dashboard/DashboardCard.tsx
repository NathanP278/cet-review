import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  accent?: "primary" | "secondary" | "success" | "warning" | "none";
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyState?: ReactNode;
  error?: string;
}

export function DashboardCard({
  title,
  description,
  children,
  className,
  contentClassName,
  accent = "none",
  isLoading,
  isEmpty,
  emptyState,
  error,
}: DashboardCardProps) {
  const accentClasses = {
    primary: "border-t-4 border-t-[var(--color-primary)]",
    secondary: "border-t-4 border-t-[var(--color-secondary)]",
    success: "border-t-4 border-t-[var(--color-success)]",
    warning: "border-t-4 border-t-[var(--color-warning)]",
    none: "",
  };

  return (
    <Card
      className={cn(
        "shadow-sm border-[var(--border)] hover:shadow-md transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4",
        accentClasses[accent],
        className
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm text-[var(--muted)]">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className={cn("pt-0", contentClassName)}>
        {error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Something went wrong
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">{error}</p>
            </div>
          </div>
        ) : isEmpty && emptyState ? (
          emptyState
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardCardSkeleton({
  accent = "none",
  className,
}: {
  accent?: "primary" | "secondary" | "success" | "warning" | "none";
  className?: string;
}) {
  const accentClasses = {
    primary: "border-t-4 border-t-[var(--color-primary)]",
    secondary: "border-t-4 border-t-[var(--color-secondary)]",
    success: "border-t-4 border-t-[var(--color-success)]",
    warning: "border-t-4 border-t-[var(--color-warning)]",
    none: "",
  };

  return (
    <Card
      className={cn(
        "shadow-sm border-[var(--border)] animate-pulse",
        accentClasses[accent],
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="h-5 w-32 bg-[var(--surface-hover)] rounded" />
        <div className="h-4 w-48 bg-[var(--surface-hover)] rounded mt-2" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <div className="h-32 w-32 rounded-full bg-[var(--surface-hover)]" />
          <div className="h-4 w-24 bg-[var(--surface-hover)] rounded" />
        </div>
      </CardContent>
    </Card>
  );
}