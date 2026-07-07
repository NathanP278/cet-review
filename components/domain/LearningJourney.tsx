"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, Clock, Zap, Target, Star, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LearningJourneyProps {
  topicsStarted: number;
  topicsMastered: number;
  totalTopics: number;
  studyTimeSeconds: number;
  cardsMastered: number;
  mockExamsCompleted: number;
}

export function LearningJourney({
  topicsStarted,
  topicsMastered,
  totalTopics,
  studyTimeSeconds,
  cardsMastered,
  mockExamsCompleted,
}: LearningJourneyProps) {
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const masteryPercent = totalTopics > 0 ? Math.round((topicsMastered / totalTopics) * 100) : 0;
  
  return (
    <Card className="flex flex-col h-full border-[var(--border)] shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[var(--color-primary)]" />
          Learning Journey
        </CardTitle>
        <CardDescription className="mt-1 text-sm">
          Your cumulative progress towards the exam
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 flex-1">
        
        {/* Topic Mastery Progress */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-[var(--muted)]">Topic Mastery</span>
            <span className="font-bold">
              {masteryPercent}% <span className="text-[var(--muted)] font-normal">({topicsMastered}/{totalTopics})</span>
            </span>
          </div>
          <Progress value={masteryPercent} className="h-2" />
        </div>

        {/* 2x2 Grid of Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--surface-hover)] border border-[var(--border)] p-3 rounded-lg flex items-center gap-3">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-md">
              <BookOpen className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-xl font-bold">{topicsStarted}</div>
              <div className="text-xs font-medium text-[var(--muted)]">Topics Started</div>
            </div>
          </div>
          
          <div className="bg-[var(--surface-hover)] border border-[var(--border)] p-3 rounded-lg flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md">
              <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xl font-bold">{cardsMastered}</div>
              <div className="text-xs font-medium text-[var(--muted)]">Cards Mastered</div>
            </div>
          </div>

          <div className="bg-[var(--surface-hover)] border border-[var(--border)] p-3 rounded-lg flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-md">
              <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-xl font-bold">{formatTime(studyTimeSeconds)}</div>
              <div className="text-xs font-medium text-[var(--muted)]">Time Studied</div>
            </div>
          </div>

          <div className="bg-[var(--surface-hover)] border border-[var(--border)] p-3 rounded-lg flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-md">
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-xl font-bold">{mockExamsCompleted}</div>
              <div className="text-xs font-medium text-[var(--muted)]">Mock Exams</div>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
