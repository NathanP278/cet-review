import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 min-h-[300px] bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)]/30 rounded-2xl border border-[var(--border)] border-dashed animate-in fade-in zoom-in duration-500",
        className
      )}
    >
      <div className="w-16 h-16 bg-[var(--color-slate-200)] dark:bg-[var(--color-slate-700)] rounded-full flex items-center justify-center mb-6 shadow-sm">
        <Icon className="w-8 h-8 text-[var(--muted)]" />
      </div>
      <h3 className="text-xl font-bold font-display text-[var(--foreground)] mb-2">{title}</h3>
      <p className="text-[var(--muted)] max-w-sm mb-6 text-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
