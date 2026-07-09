"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, BookOpen, Brain, Target } from "lucide-react";
import Link from "next/link";

interface Subject {
  name: string;
  readiness: number;
  mastery: number;
  retention: number;
  quizAccuracy: number;
  questionsAnswered: number;
  cardsLearned: number;
  cardsDue: number;
  trend: 'improving' | 'stable' | 'declining';
  confidence: string;
  improvementPotential: number;
}

interface SubjectReadinessCardProps {
  subject: Subject;
  isExpanded: boolean;
  onToggle: () => void;
}

export function SubjectReadinessCard({
  subject,
  isExpanded,
  onToggle,
}: SubjectReadinessCardProps) {
  const getTrendIcon = () => {
    switch (subject.trend) {
      case 'improving':
        return <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />;
      case 'declining':
        return <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />;
      default:
        return <Minus className="h-3 w-3 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <h4 className="font-semibold text-[var(--foreground)]">
            {subject.name}
          </h4>
          
          {/* Readiness Score */}
          <div className="flex items-end justify-between">
            <div>
              <span className={`text-3xl font-bold ${getReadinessColor(subject.readiness)}`}>
                {subject.readiness}%
              </span>
              <span className="text-xs text-[var(--muted)] ml-2">readiness</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
              {getTrendIcon()}
              <span className="capitalize">{subject.trend}</span>
            </div>
          </div>

          <Progress value={subject.readiness} className="h-2" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-[var(--accent)] rounded">
            <div className="text-xs text-[var(--muted)]">Mastery</div>
            <div className="text-sm font-bold text-[var(--foreground)]">
              {subject.mastery}%
            </div>
          </div>
          <div className="p-2 bg-[var(--accent)] rounded">
            <div className="text-xs text-[var(--muted)]">Retention</div>
            <div className="text-sm font-bold text-[var(--foreground)]">
              {subject.retention}%
            </div>
          </div>
          <div className="p-2 bg-[var(--accent)] rounded">
            <div className="text-xs text-[var(--muted)]">Accuracy</div>
            <div className="text-sm font-bold text-[var(--foreground)]">
              {subject.quizAccuracy}%
            </div>
          </div>
        </div>

        {/* Expand Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full text-xs"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show Details
            </>
          )}
        </Button>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="pt-4 border-t border-[var(--border)] space-y-3">
            {/* Detailed Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--muted)]">Questions Answered</span>
                <span className="font-medium text-[var(--foreground)]">
                  {subject.questionsAnswered}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--muted)]">Cards Learned</span>
                <span className="font-medium text-[var(--foreground)]">
                  {subject.cardsLearned}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--muted)]">Cards Due</span>
                <span className="font-medium text-[var(--foreground)]">
                  {subject.cardsDue}
                </span>
              </div>
            </div>

            {/* Improvement Potential */}
            {subject.improvementPotential > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Improvement Potential
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  You can gain up to +{subject.improvementPotential.toFixed(0)}% readiness by focusing on this subject
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Link href={`/subjects/${subject.name.toLowerCase()}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Study
                </Button>
              </Link>
              <Link href="/practice" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  Quiz
                </Button>
              </Link>
              {subject.cardsDue > 0 && (
                <Link href="/review/session" className="flex-1">
                  <Button size="sm" className="w-full text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    Review
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}