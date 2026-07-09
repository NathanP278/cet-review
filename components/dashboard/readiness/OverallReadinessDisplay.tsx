"use client";

import { useEffect, useState } from "react";
import { AccuracyRing } from "@/components/domain/AccuracyRing";
import type { CETReadiness } from "@/types/dashboard";
import { ReadinessLevelBadge } from "./ReadinessLevelBadge";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { TrendIndicator } from "./TrendIndicator";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

interface OverallReadinessDisplayProps {
  readiness: CETReadiness;
}

export function OverallReadinessDisplay({ readiness }: OverallReadinessDisplayProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldAnimate(!mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setShouldAnimate(!e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Animate counter on mount or when score changes
  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayScore(readiness.overallScore);
      return;
    }

    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = readiness.overallScore / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= readiness.overallScore) {
        setDisplayScore(readiness.overallScore);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [readiness.overallScore, shouldAnimate]);

  return (
    <Card className="p-6 shadow-sm border-[var(--border)]">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              CET Readiness
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              Your comprehensive exam preparation score
            </p>
          </div>
          
          <button
            className="p-2 rounded-md hover:bg-[var(--accent)] transition-colors group relative"
            aria-label="How readiness is calculated"
            title="Your readiness score combines 9 dimensions: mock exams, subject mastery, memory retention, practice performance, consistency, review completion, learning velocity, study time, and confidence."
          >
            <Info className="h-4 w-4 text-[var(--muted)]" />
          </button>
        </div>

        {/* Main Display */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left: Circular Progress */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <AccuracyRing
                accuracy={displayScore}
                size={180}
                label="Readiness"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-4xl font-bold text-[var(--foreground)]"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {displayScore}%
                </span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <ReadinessLevelBadge score={readiness.overallScore} />
              <ConfidenceBadge level={readiness.confidenceLevel} />
            </div>
          </div>

          {/* Right: Stats */}
          <div className="flex flex-col gap-4 flex-1 w-full md:w-auto">
            {/* Trend */}
            <div className="flex items-center justify-between p-4 bg-[var(--accent)] rounded-lg">
              <span className="text-sm font-medium text-[var(--muted)]">
                Trend
              </span>
              <TrendIndicator trend={readiness.trend} />
            </div>

            {/* Estimated Exam Score */}
            {readiness.estimatedExamDayScore > 0 && (
              <div className="flex items-center justify-between p-4 bg-[var(--accent)] rounded-lg">
                <span className="text-sm font-medium text-[var(--muted)]">
                  Est. Exam Day Score
                </span>
                <span className="text-lg font-bold text-[var(--foreground)]">
                  {readiness.estimatedExamDayScore}%
                </span>
              </div>
            )}

            {/* Mock Exams Taken */}
            <div className="flex items-center justify-between p-4 bg-[var(--accent)] rounded-lg">
              <span className="text-sm font-medium text-[var(--muted)]">
                Mock Exams
              </span>
              <span className="text-lg font-bold text-[var(--foreground)]">
                {readiness.mockExamsTaken}
              </span>
            </div>

            {/* Confidence Score */}
            <div className="flex items-center justify-between p-4 bg-[var(--accent)] rounded-lg">
              <span className="text-sm font-medium text-[var(--muted)]">
                Confidence
              </span>
              <span className="text-lg font-bold text-[var(--foreground)]">
                {readiness.confidenceScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-[var(--muted)] text-center pt-2 border-t border-[var(--border)]">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </Card>
  );
}