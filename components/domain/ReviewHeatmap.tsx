"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ReviewHeatmapProps {
  data: { date: string; count: number }[];
  days?: number;
}

export function ReviewHeatmap({ data, days = 365 }: ReviewHeatmapProps) {
  const heatmapData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const map = new Map<string, number>();
    data.forEach(d => {
      const date = new Date(d.date).toISOString().split('T')[0];
      map.set(date, d.count);
    });

    const weeks: { date: string; count: number; empty?: boolean }[][] = [];
    let currentWeek: { date: string; count: number; empty?: boolean }[] = [];
    let maxCount = 1;

    // Calculate oldest date
    const oldest = new Date(today);
    oldest.setDate(oldest.getDate() - (days - 1));
    const startDayOfWeek = oldest.getDay(); // 0 is Sunday

    // Pad beginning to align days of week
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({ date: `empty-start-${i}`, count: 0, empty: true });
    }

    const monthLabels: { month: string; colIndex: number }[] = [];
    let currentMonth = oldest.getMonth();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const m = d.getMonth();
      if (m !== currentMonth && d.getDate() <= 7) {
        monthLabels.push({ month: d.toLocaleString('default', { month: 'short' }), colIndex: weeks.length });
        currentMonth = m;
      }

      const count = map.get(dateStr) || 0;
      if (count > maxCount) maxCount = count;
      currentWeek.push({ date: dateStr, count });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      // Pad end if necessary, though grid-flow-col handles missing cells, explicit padding is cleaner
      while (currentWeek.length < 7) {
        currentWeek.push({ date: `empty-end-${currentWeek.length}`, count: 0, empty: true });
      }
      weeks.push(currentWeek);
    }

    return { weeks, maxCount, monthLabels };
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
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-max flex gap-2">
        {/* Days of week labels */}
        <div className="flex flex-col gap-1 text-[10px] text-[var(--muted)] font-medium pt-5 pr-2">
          <div className="h-3" /> {/* Sun */}
          <div className="h-3 flex items-center leading-none">Mon</div>
          <div className="h-3" /> {/* Tue */}
          <div className="h-3 flex items-center leading-none">Wed</div>
          <div className="h-3" /> {/* Thu */}
          <div className="h-3 flex items-center leading-none">Fri</div>
          <div className="h-3" /> {/* Sat */}
        </div>

        {/* Heatmap Grid with Month Labels */}
        <div className="flex flex-col">
          {/* Month labels */}
          <div className="relative h-5 w-full text-[10px] text-[var(--muted)] font-medium">
            {heatmapData.monthLabels.map((m, i) => (
              <span 
                key={i} 
                className="absolute" 
                style={{ left: `${m.colIndex * (12 + 4)}px` }} // 12px width + 4px gap per column
              >
                {m.month}
              </span>
            ))}
          </div>

          <div className="flex gap-1">
            {heatmapData.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((cell) => (
                  <div
                    key={cell.date}
                    className={cn(
                      "w-3 h-3 rounded-sm transition-colors",
                      cell.empty ? "opacity-0" : getColorClass(cell.count, heatmapData.maxCount)
                    )}
                    title={cell.empty ? undefined : `${cell.count} activities on ${cell.date}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end mt-4 text-xs text-[var(--muted)] w-full gap-2 pr-4">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)]" />
          <div className="w-3 h-3 rounded-sm bg-[var(--color-success-light)]/40" />
          <div className="w-3 h-3 rounded-sm bg-[var(--color-success-light)]/70" />
          <div className="w-3 h-3 rounded-sm bg-[var(--color-success)]/80" />
          <div className="w-3 h-3 rounded-sm bg-[var(--color-success-dark)]" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
