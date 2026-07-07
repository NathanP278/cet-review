"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

export interface ExamTimerProps {
  initialSeconds: number;
  onExpire: () => void;
  onTick?: (timeLeft: number) => void;
  className?: string;
}

export function ExamTimer({ initialSeconds, onExpire, onTick, className }: ExamTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    // If the timer reaches 0, trigger onExpire and stop counting
    if (timeLeft <= 0) {
      onExpire();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((t) => {
        const next = t - 1;
        if (onTick) onTick(next);
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onExpire, onTick]);

  // Format MM:SS or HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const isWarning = timeLeft <= 600 && timeLeft > 60; // 10 minutes left warning
  const isCritical = timeLeft <= 60; // 1 minute left warning

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-lg font-bold border transition-colors",
        isCritical
          ? "bg-red-500/10 text-red-500 border-red-500 animate-pulse"
          : isWarning
          ? "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]"
          : "bg-[var(--surface)] border-[var(--border)]",
        className
      )}
    >
      <Clock className="h-5 w-5" />
      {formatTime(timeLeft)}
    </div>
  );
}
