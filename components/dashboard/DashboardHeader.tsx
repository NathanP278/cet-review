import { Flame, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  streak?: number;
  level?: number;
  xp?: number;
  className?: string;
}

export function DashboardHeader({
  title = "Command Center",
  subtitle = "Your comprehensive view of CET exam readiness and study progress.",
  streak = 0,
  level,
  xp,
  className,
}: DashboardHeaderProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={cn(
        "flex flex-col gap-4 animate-in fade-in-50 slide-in-from-top-4 duration-500",
        className
      )}
    >
      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="h-4 w-4 text-[var(--muted)]" />
            <span className="text-sm text-[var(--muted)]">{today}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-[var(--foreground)] mb-1">
            {title}
          </h1>
          <p className="text-[var(--muted)] text-sm md:text-base max-w-2xl">
            {subtitle}
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Streak Badge */}
          {streak > 0 && (
            <div className="flex items-center gap-2 bg-gradient-to-br from-orange-500/10 to-red-500/10 px-4 py-2.5 rounded-xl border border-orange-500/20 shadow-sm hover:shadow-md transition-all duration-300 group">
              <Flame className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform duration-300" />
              <div className="flex flex-col">
                <span className="text-xs text-[var(--muted)] leading-none">
                  Day Streak
                </span>
                <span className="font-bold text-lg leading-none mt-0.5">
                  {streak}
                </span>
              </div>
            </div>
          )}

          {/* Level Badge - Placeholder for future sprint */}
          {level !== undefined && (
            <div className="flex items-center gap-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 px-4 py-2.5 rounded-xl border border-blue-500/20 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex flex-col">
                <span className="text-xs text-[var(--muted)] leading-none">
                  Level
                </span>
                <span className="font-bold text-lg leading-none mt-0.5">
                  {level}
                </span>
              </div>
            </div>
          )}

          {/* XP Badge - Placeholder for future sprint */}
          {xp !== undefined && (
            <div className="flex items-center gap-2 bg-gradient-to-br from-green-500/10 to-emerald-500/10 px-4 py-2.5 rounded-xl border border-green-500/20 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex flex-col">
                <span className="text-xs text-[var(--muted)] leading-none">
                  XP
                </span>
                <span className="font-bold text-lg leading-none mt-0.5">
                  {xp.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 bg-[var(--surface-hover)] rounded" />
          <div className="h-10 w-64 bg-[var(--surface-hover)] rounded" />
          <div className="h-4 w-96 bg-[var(--surface-hover)] rounded" />
        </div>
        <div className="flex gap-3">
          <div className="h-14 w-24 bg-[var(--surface-hover)] rounded-xl" />
        </div>
      </div>
    </div>
  );
}