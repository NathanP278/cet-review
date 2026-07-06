"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccuracyRing } from "@/components/domain/AccuracyRing";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";

export interface QuizResultsProps {
  score: number;
  total: number;
  onRetry?: () => void;
}

export function QuizResults({ score, total, onRetry }: QuizResultsProps) {
  const accuracy = Math.round((score / total) * 100) || 0;

  useEffect(() => {
    if (accuracy >= 60) {
      // Fire confetti if they did decently well
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          })
        );
        confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          })
        );
      }, 250);
    }
  }, [accuracy]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-display">Session Complete!</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 p-6">
          <AccuracyRing accuracy={accuracy} size={140} label="Final Score" />

          <div className="text-[var(--muted)]">
            You got <strong className="text-[var(--foreground)]">{score}</strong> out of{" "}
            <strong className="text-[var(--foreground)]">{total}</strong> questions correct.
          </div>

          <div className="flex flex-col w-full gap-3 mt-4">
            {onRetry && (
              <Button variant="outline" onClick={onRetry} className="gap-2 w-full">
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            <Link href="/subjects" className="w-full">
              <Button className="w-full gap-2">
                Continue Learning
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
