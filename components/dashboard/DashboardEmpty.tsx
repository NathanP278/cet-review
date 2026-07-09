import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center gap-4">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-[var(--surface-hover)] flex items-center justify-center text-[var(--muted)]">
          {icon}
        </div>
      )}
      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
        <p className="text-sm text-[var(--muted)] leading-relaxed">{description}</p>
      </div>
      {action && (
        <Link href={action.href}>
          <Button size="sm" className="mt-2">
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}

// Pre-built empty states for common scenarios
export function NoReviewsEmpty() {
  return (
    <EmptyState
      icon={
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      }
      title="No Reviews Due"
      description="Great job! You've completed all your reviews for today. Keep up the momentum by practicing more questions."
      action={{
        label: "Practice Now",
        href: "/practice",
      }}
    />
  );
}

export function NoMockExamsEmpty() {
  return (
    <EmptyState
      icon={
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      }
      title="No Mock Exams Yet"
      description="Take your first mock exam to get a baseline measurement of your CET readiness and track your improvement over time."
      action={{
        label: "Take Mock Exam",
        href: "/exam",
      }}
    />
  );
}

export function NoActivityEmpty() {
  return (
    <EmptyState
      icon={
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      }
      title="No Activity Yet"
      description="Start your CET preparation journey by taking a practice quiz or reviewing flashcards. Your progress will appear here."
      action={{
        label: "Start Learning",
        href: "/subjects",
      }}
    />
  );
}

export function NoCardsEmpty() {
  return (
    <EmptyState
      icon={
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      }
      title="No Flashcards Yet"
      description="Create flashcards by practicing questions. Each question you answer will be added to your spaced repetition system."
      action={{
        label: "Practice Questions",
        href: "/practice",
      }}
    />
  );
}

export function NoStreakEmpty() {
  return (
    <EmptyState
      icon={
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
          />
        </svg>
      }
      title="Start Your Streak"
      description="Study consistently every day to build a streak. Consistency is key to mastering the CET exam."
      action={{
        label: "Start Today",
        href: "/practice",
      }}
    />
  );
}