"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ReviewHeatmapProps {
  data: { date: string; count: number }[];
  days?: number;
}

export function ReviewHeatmap({ data, days = 90 }: ReviewHeatmapProps) {
  const heatmapData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const map = new Map<string, number>();
    data.forEach(d => {
      const date = new Date(d.date).toISOString().split('T')[0];
      map.set(date, d.count);
    });

    const grid: { date: string; count: number; empty?: boolean }[] = [];
    let maxCount = 1;

    // Calculate oldest date
    const oldest = new Date(today);
    oldest.setDate(oldest.getDate() - (days - 1));
    const startDayOfWeek = oldest.getDay(); // 0 is Sunday

    // Pad beginning to align days of week
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push({ date: `empty-start-${i}`, count: 0, empty: true });
    }

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = map.get(dateStr) || 0;
      if (count > maxCount) maxCount = count;
      grid.push({ date: dateStr, count });
    }

    return { grid, maxCount };
  }, [data, days]);

  const getColorClass = (count: number, maxCount: number) => {
    if (count === 0) return "bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)]";
    const ratio = count / Math.max(maxCount, 50); // Assume 50 is a solid day
    if (ratio < 0.25) return "bg-[var(--color-success-light)]/40";
    if (ratio < 0.5) return "bg-[var(--color-success-light)]/70";
    if (ratio < 0.75) return "bg-[var(--color-success)]/80";
    return "bg-[var(--color-success-dark)]";
  };

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex flex-col gap-1 min-w-max">
        <div className="grid grid-rows-7 grid-flow-col gap-1">
          {heatmapData.grid.map((cell) => (
            <div
              key={cell.date}
              className={cn(
                "w-3 h-3 md:w-4 md:h-4 rounded-sm transition-colors",
                cell.empty ? "opacity-0" : getColorClass(cell.count, heatmapData.maxCount)
              )}
              title={cell.empty ? undefined : `${cell.date}: ${cell.count} reviews`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-[var(--muted)] w-full">
        <span>{days} days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
