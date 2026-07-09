"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import type { CETReadiness } from "@/types/dashboard";
import { DimensionBreakdownCard } from "./DimensionBreakdownCard";
import { ContributionVisualization } from "./ContributionVisualization";
import { 
  Target, 
  BookOpen, 
  Brain, 
  ClipboardCheck, 
  Calendar, 
  CheckCircle, 
  Zap, 
  Clock, 
  Award 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReadinessBreakdownCenterProps {
  readiness: CETReadiness;
}

export function ReadinessBreakdownCenter({ readiness }: ReadinessBreakdownCenterProps) {
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'visualization'>('cards');

  if (!readiness.breakdown) {
    return null;
  }

  const dimensions = [
    {
      id: 'mockExams',
      name: 'Mock Exams',
      score: readiness.breakdown.mockExams,
      maxScore: 30,
      weight: 30,
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      shortExplanation: 'Performance on full-length practice tests',
      fullExplanation: 'Mock exams simulate real test conditions and are the strongest predictor of actual exam performance. Taking multiple mock exams helps calibrate your readiness score.',
      calculationExplanation: 'Calculated from your mock exam scores, completion rate, and consistency across attempts.',
      trend: 'improving' as const,
    },
    {
      id: 'subjectMastery',
      name: 'Subject Mastery',
      score: readiness.breakdown.subjectMastery,
      maxScore: 25,
      weight: 25,
      icon: BookOpen,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
      shortExplanation: 'Understanding across all subjects',
      fullExplanation: 'Subject mastery measures how well you understand each topic across all subjects. Higher mastery indicates comprehensive knowledge coverage.',
      calculationExplanation: 'Average mastery percentage across all subjects weighted by their importance in the CET.',
      trend: 'stable' as const,
    },
    {
      id: 'memoryRetention',
      name: 'Memory Retention',
      score: readiness.breakdown.memoryRetention,
      maxScore: 15,
      weight: 15,
      icon: Brain,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      shortExplanation: 'How well you retain learned material',
      fullExplanation: 'Memory retention tracks your ability to recall information over time using the SM-2 spaced repetition algorithm.',
      calculationExplanation: 'Based on average ease factor and retention scores from your flashcard reviews.',
      trend: 'improving' as const,
    },
    {
      id: 'practiceQuizzes',
      name: 'Practice Quizzes',
      score: readiness.breakdown.practiceQuizzes,
      maxScore: 10,
      weight: 10,
      icon: ClipboardCheck,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      shortExplanation: 'Performance on topic-specific quizzes',
      fullExplanation: 'Practice quizzes help identify strengths and weaknesses in specific topics before attempting full mock exams.',
      calculationExplanation: 'Average score across all completed practice quizzes, weighted by difficulty.',
      trend: 'stable' as const,
    },
    {
      id: 'consistency',
      name: 'Consistency',
      score: readiness.breakdown.consistency,
      maxScore: 8,
      weight: 8,
      icon: Calendar,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950',
      shortExplanation: 'Regular study habits and activity',
      fullExplanation: 'Consistency measures how regularly you study. Maintaining consistent study habits leads to better long-term retention.',
      calculationExplanation: 'Based on study streaks, active days per month, and review completion rate.',
      trend: 'declining' as const,
    },
    {
      id: 'reviewCompletion',
      name: 'Review Completion',
      score: readiness.breakdown.reviewCompletion,
      maxScore: 5,
      weight: 5,
      icon: CheckCircle,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950',
      shortExplanation: 'Completion of daily review sessions',
      fullExplanation: 'Review completion tracks whether you complete your daily spaced repetition reviews on time.',
      calculationExplanation: 'Percentage of due cards reviewed on time over the past 30 days.',
      trend: 'stable' as const,
    },
    {
      id: 'learningVelocity',
      name: 'Learning Velocity',
      score: readiness.breakdown.learningVelocity,
      maxScore: 3,
      weight: 3,
      icon: Zap,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      shortExplanation: 'Speed of learning new material',
      fullExplanation: 'Learning velocity measures how quickly you master new topics and cards.',
      calculationExplanation: 'Rate of new cards learned and topics completed per week.',
      trend: 'improving' as const,
    },
    {
      id: 'studyTime',
      name: 'Study Time',
      score: readiness.breakdown.studyTime,
      maxScore: 2,
      weight: 2,
      icon: Clock,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-950',
      shortExplanation: 'Total time spent studying',
      fullExplanation: 'Study time tracks the total hours you dedicate to review sessions, quizzes, and mock exams.',
      calculationExplanation: 'Cumulative study time across all activities.',
      trend: 'stable' as const,
    },
    {
      id: 'confidence',
      name: 'Confidence',
      score: readiness.breakdown.confidence,
      maxScore: 2,
      weight: 2,
      icon: Award,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
      shortExplanation: 'Statistical confidence in prediction',
      fullExplanation: 'Confidence measures how reliable the readiness prediction is based on the amount and quality of data.',
      calculationExplanation: 'Based on sample size, calibration status, and data recency.',
      trend: 'improving' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Readiness Breakdown
          </h3>
          <p className="text-sm text-[var(--muted)] mt-1">
            Detailed analysis of all 9 readiness dimensions
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            Cards
          </Button>
          <Button
            variant={viewMode === 'visualization' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('visualization')}
          >
            Chart
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dimensions.map((dimension) => (
            <DimensionBreakdownCard
              key={dimension.id}
              dimension={dimension}
              isExpanded={expandedDimension === dimension.id}
              onToggle={() =>
                setExpandedDimension(
                  expandedDimension === dimension.id ? null : dimension.id
                )
              }
            />
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <ContributionVisualization dimensions={dimensions} />
        </Card>
      )}
    </div>
  );
}