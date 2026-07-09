import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DashboardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function DashboardGrid({
  children,
  columns = 3,
  className,
}: DashboardGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid gap-4 md:gap-6",
        gridClasses[columns],
        className
      )}
    >
      {children}
    </div>
  );
}

interface DashboardSectionProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function DashboardSection({
  title,
  subtitle,
  icon,
  children,
  className,
  action,
}: DashboardSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 animate-in fade-in-50 slide-in-from-bottom-4",
        className
      )}
    >
      {(title || subtitle) && (
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="mt-0.5 text-[var(--color-primary)]">{icon}</div>
            )}
            <div>
              {title && (
                <h2 className="text-xl md:text-2xl font-bold font-display text-[var(--foreground)]">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-[var(--muted)] mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}