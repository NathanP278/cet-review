"use client";

import { CircularProgressbarWithChildren, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export function AccuracyRing({
  accuracy,
  size = 64,
  label = "Accuracy",
}: {
  accuracy: number;
  size?: number;
  label?: string;
}) {
  const getColor = (acc: number) => {
    if (acc >= 80) return "var(--color-success)";
    if (acc >= 60) return "var(--color-warning)";
    return "var(--color-danger)";
  };

  const color = getColor(accuracy);

  return (
    <div style={{ width: size, height: size }}>
      <CircularProgressbarWithChildren
        value={accuracy}
        strokeWidth={10}
        styles={buildStyles({
          pathColor: color,
          trailColor: "var(--border)",
          strokeLinecap: "round",
        })}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <strong 
            className="font-bold text-[var(--foreground)] leading-none"
            style={{ fontSize: Math.max(14, size * 0.22) }}
          >
            {Math.round(accuracy)}%
          </strong>
          {size >= 80 && (
            <span 
              className="text-[var(--muted)] mt-1"
              style={{ fontSize: Math.max(10, size * 0.1) }}
            >
              {label}
            </span>
          )}
        </div>
      </CircularProgressbarWithChildren>
    </div>
  );
}
