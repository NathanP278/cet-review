import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, BookOpen, Brain } from "lucide-react";
import Link from "next/link";

export function ReadinessEmptyState() {
  return (
    <Card className="p-8 text-center border-[var(--border)]">
      <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900 rounded-full blur-xl opacity-50" />
          <div className="relative p-4 bg-blue-50 dark:bg-blue-950 rounded-full">
            <Target className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            Start Your CET Journey
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Build your readiness score by completing mock exams, practicing with quizzes,
            and maintaining consistent review habits.
          </p>
        </div>

        {/* Action Steps */}
        <div className="w-full space-y-3 text-left">
          <div className="flex items-start gap-3 p-3 bg-[var(--accent)] rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Take your first mock exam
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Get baseline measurement of your knowledge
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-[var(--accent)] rounded-lg">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Complete practice quizzes
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Build knowledge across different subjects
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-[var(--accent)] rounded-lg">
            <Target className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Review flashcards daily
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Strengthen memory retention with spaced repetition
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-3 w-full">
          <Link href="/exam" className="flex-1">
            <Button className="w-full">Take Mock Exam</Button>
          </Link>
          <Link href="/practice" className="flex-1">
            <Button variant="outline" className="w-full">Practice Quiz</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}