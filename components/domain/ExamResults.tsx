"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccuracyRing } from "@/components/domain/AccuracyRing";
import Link from "next/link";
import { BarChart3, ArrowRight, RotateCcw } from "lucide-react";

export interface SubjectScore {
  name: string;
  score: number;
  total: number;
}

export interface ExamResultsProps {
  totalScore: number;
  totalQuestions: number;
  subjectScores: SubjectScore[];
  onRetry?: () => void;
}

export function ExamResults({
  totalScore,
  totalQuestions,
  subjectScores,
  onRetry,
}: ExamResultsProps) {
  const overallAccuracy = Math.round((totalScore / totalQuestions) * 100) || 0;

  useEffect(() => {
    if (overallAccuracy >= 60) {
      const duration = 4 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
          })
        );
      }, 250);
    }
  }, [overallAccuracy]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto py-8 animate-in fade-in zoom-in duration-500">
      <Card className="w-full border-t-4 border-t-[var(--color-primary)]">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-display">Mock Exam Complete</CardTitle>
          <CardDescription>Great job! Here is your performance breakdown.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 p-6 sm:p-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            <AccuracyRing accuracy={overallAccuracy} size={160} label="Overall Score" />
            <div className="flex flex-col gap-2 text-center md:text-left">
              <h3 className="text-2xl font-bold">
                {totalScore}{" "}
                <span className="text-lg text-[var(--muted)] font-normal">/ {totalQuestions}</span>
              </h3>
              <p className="text-[var(--muted)] max-w-[250px]">
                {overallAccuracy >= 80
                  ? "Outstanding! You have a very strong grasp of the material."
                  : overallAccuracy >= 60
                    ? "Good work! Review your weaker subjects to improve further."
                    : "Keep practicing! Use the Spaced Repetition flashcards to memorize core concepts."}
              </p>
            </div>
          </div>

          <div className="w-full h-px bg-[var(--border)]" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-4">
              <BarChart3 className="h-5 w-5 text-[var(--color-primary)]" />
              Subject Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjectScores.map((subject, idx) => {
                const subAccuracy = Math.round((subject.score / subject.total) * 100) || 0;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
                  >
                    <span className="font-medium">{subject.name}</span>
                    <div className="flex flex-col items-end">
                      <span className="font-bold">
                        {subject.score} / {subject.total}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          subAccuracy >= 70
                            ? "text-[var(--color-success)]"
                            : subAccuracy >= 50
                              ? "text-[var(--color-warning)]"
                              : "text-[var(--color-danger)]"
                        )}
                      >
                        {subAccuracy}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-4">
            {onRetry && (
              <Button variant="outline" onClick={onRetry} className="w-full sm:w-auto gap-2">
                <RotateCcw className="h-4 w-4" />
                Take Another
              </Button>
            )}
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button className="w-full gap-2">
                Back to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
