"use client";

import type { CETReadiness } from "@/types/dashboard";
import { DimensionCard } from "./DimensionCard";
import { Brain, Zap, Target } from "lucide-react";

interface ReadinessDimensionsPanelProps {
  readiness: CETReadiness;
  expandedDimension: string | null;
  onDimensionToggle: (dimension: string | null) => void;
}

export function ReadinessDimensionsPanel({
  readiness,
  expandedDimension,
  onDimensionToggle,
}: ReadinessDimensionsPanelProps) {
  // Extract dimensions from readiness data
  // Note: F2.2.5 added dimensions to ReadinessMetrics, but CETReadiness in dashboard types doesn't have it yet
  // For now, we'll calculate placeholder values from breakdown until types are synced
  
  const knowledgeScore = readiness.breakdown 
    ? Math.round((readiness.breakdown.subjectMastery / 25) * 100 * 0.5 + 
                 (readiness.breakdown.practiceQuizzes / 10) * 100 * 0.3 + 
                 (readiness.breakdown.learningVelocity / 3) * 100 * 0.2)
    : 0;

  const memoryScore = readiness.breakdown
    ? Math.round((readiness.breakdown.memoryRetention / 15) * 100 * 0.7 + 
                 (readiness.breakdown.reviewCompletion / 5) * 100 * 0.3)
    : 0;

  const examScore = readiness.breakdown
    ? Math.round((readiness.breakdown.mockExams / 30) * 100 * 0.6 + 
                 (readiness.breakdown.consistency / 8) * 100 * 0.3 + 
                 (readiness.breakdown.studyTime / 2) * 100 * 0.1)
    : 0;

  const dimensions = [
    {
      id: 'knowledge',
      name: 'Knowledge Readiness',
      score: knowledgeScore,
      icon: Brain,
      description: 'How much of the CET syllabus you currently know',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      id: 'memory',
      name: 'Memory Readiness',
      score: memoryScore,
      icon: Zap,
      description: 'How well you retain what you\'ve learned',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      id: 'exam',
      name: 'Exam Readiness',
      score: examScore,
      icon: Target,
      description: 'How prepared you are for exam-day performance',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
          Readiness Dimensions
        </h3>
        <p className="text-sm text-[var(--muted)]">
          Your readiness broken down into three key areas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dimensions.map((dimension) => (
          <DimensionCard
            key={dimension.id}
            dimension={dimension}
            isExpanded={expandedDimension === dimension.id}
            onToggle={() =>
              onDimensionToggle(
                expandedDimension === dimension.id ? null : dimension.id
              )
            }
          />
        ))}
      </div>
    </div>
  );
}