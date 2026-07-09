"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, Clock, Brain, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

interface StudyPlanProps {
  dueReviews: number;
  newCards: number;
  completedReviews: number;
  dailyReviewLimit: number;
  avgTimePerCardSecs: number;
}

export function StudyPlan({ 
  dueReviews, 
  newCards, 
  completedReviews,
  dailyReviewLimit,
  avgTimePerCardSecs 
}: StudyPlanProps) {
  
  // Total cards that need attention today
  const totalCardsToday = Math.min(dueReviews + newCards, dailyReviewLimit);
  const remainingCards = Math.max(0, totalCardsToday - completedReviews);
  
  // Progress calculation
  const progressPercent = totalCardsToday > 0 
    ? Math.min((completedReviews / totalCardsToday) * 100, 100)
    : 100;

  // Estimated time calculation
  const estimatedTimeMins = Math.ceil((remainingCards * avgTimePerCardSecs) / 60);

  const isComplete = progressPercent >= 100 && totalCardsToday > 0;

  return (
    <Card className="flex flex-col h-full border-[var(--border)] shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-[var(--color-primary)]" />
              Today's Study Plan
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              Personalized path based on your retention data
            </CardDescription>
          </div>
          {isComplete && (
            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Complete
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-6 flex-1">
        
        {/* Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-[var(--muted)]">Daily Goal</span>
            <span className="font-bold">
              {completedReviews} <span className="text-[var(--muted)] font-normal">/ {totalCardsToday || "0"} cards</span>
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Actionable Metrics */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="bg-[var(--surface-hover)] border border-[var(--border)] p-3 rounded-lg flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
              <Brain className="w-4 h-4 text-orange-500" />
              Due Reviews
            </div>
            <span className="text-2xl font-bold">{dueReviews}</span>
          </div>
          
          <div className="bg-[var(--surface-hover)] border border-[var(--border)] p-3 rounded-lg flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
              <Zap className="w-4 h-4 text-blue-500" />
              New Concepts
            </div>
            <span className="text-2xl font-bold">{newCards}</span>
          </div>
        </div>

        {/* Estimated Time */}
        <div className="flex items-center gap-3 text-sm text-[var(--muted)] bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)] border-dashed">
          <Clock className="w-5 h-5 text-[var(--color-primary)]" />
          <span>
            Estimated time to clear queue: <strong className="text-[var(--foreground)]">{estimatedTimeMins} mins</strong>
          </span>
        </div>

        <div className="mt-auto pt-4 flex gap-3">
          <Link href="/review/session" className="flex-1">
            <Button className="w-full group">
              Start Session
              <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/practice" className="flex-1">
            <Button variant="outline" className="w-full">
              Practice Quiz
            </Button>
          </Link>
        </div>

      </CardContent>
    </Card>
  );
}
