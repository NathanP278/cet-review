"use client";

import { cn } from "@/lib/utils";

export interface ExamNavigationGridProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<number, string>; // Maps index -> optionId
  flagged: Set<number>;
  onNavigate: (index: number) => void;
  className?: string;
}

export function ExamNavigationGrid({
  totalQuestions,
  currentIndex,
  answers,
  flagged,
  onNavigate,
  className,
}: ExamNavigationGridProps) {
  // Generate an array of numbers from 0 to totalQuestions - 1
  const indices = Array.from({ length: totalQuestions }, (_, i) => i);

  return (
    <div className={cn("grid grid-cols-5 gap-2", className)}>
      {indices.map((index) => {
        const isCurrent = index === currentIndex;
        const isAnswered = answers[index] !== undefined;
        const isFlagged = flagged.has(index);

        return (
          <button
            key={index}
            onClick={() => onNavigate(index)}
            className={cn(
              "relative flex items-center justify-center h-10 rounded-md text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1",
              // State colors
              isCurrent
                ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/50 font-bold"
                : "border-[var(--border)] hover:border-[var(--muted)]",

              isAnswered && !isCurrent
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                : "bg-[var(--surface)]",

              isFlagged && !isCurrent
                ? "bg-[var(--color-warning-light)]/20 text-[var(--color-warning-dark)] border-[var(--color-warning)]"
                : ""
            )}
            title={isFlagged ? "Flagged for review" : isAnswered ? "Answered" : "Unanswered"}
          >
            {index + 1}
            {/* Small flag indicator dot */}
            {isFlagged && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--color-warning)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
