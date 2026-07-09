"use client";

import { Card } from "@/components/ui/card";
import type { CETReadiness } from "@/types/dashboard";
import { TrendingUp, Target, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ReadinessPotentialCardProps {
  readiness: CETReadiness;
}

export function ReadinessPotentialCard({ readiness }: ReadinessPotentialCardProps) {
  // Calculate potential readiness (simplified - in reality comes from F2.2.5 backend)
  // For now, estimate based on current score and mock exam opportunities
  const currentReadiness = readiness.overallScore;
  const maxPossibleGain = 100 - currentReadiness;
  
  // Estimate potential gain opportunities
  const mockExamGap = Math.max(0, 3 - readiness.mockExamsTaken) * 3; // Up to 9% from mock exams
  const reviewGap = readiness.breakdown ? (5 - readiness.breakdown.reviewCompletion) * 2 : 0; // Up to 10% from reviews
  const consistencyGap = readiness.breakdown ? (8 - readiness.breakdown.consistency) * 1.5 : 0; // Up to 12% from consistency
  
  const estimatedPotentialGain = Math.min(
    Math.round(mockExamGap + reviewGap + consistencyGap),
    maxPossibleGain
  );
  
  const potentialReadiness = Math.min(currentReadiness + estimatedPotentialGain, 100);
  const readinessCeiling = 100; // Simplified - in reality depends on content availability

  return (
    <Card className="p-6 shadow-sm border-[var(--border)]">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Readiness Potential
            </h3>
            <p className="text-sm text-[var(--muted)] mt-1">
              How much your readiness can improve with focused effort
            </p>
          </div>
          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>

        {/* Current vs Potential Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current */}
          <div className="text-center p-4 bg-[var(--accent)] rounded-lg">
            <div className="text-sm text-[var(--muted)] mb-2">Current</div>
            <div className="text-3xl font-bold text-[var(--foreground)]">
              {currentReadiness}%
            </div>
          </div>

          {/* Potential Gain */}
          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm text-[var(--muted)] mb-2">Potential Gain</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              +{estimatedPotentialGain}%
            </div>
          </div>

          {/* Potential */}
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-[var(--muted)] mb-2">Potential</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {potentialReadiness}%
            </div>
          </div>
        </div>

        {/* Visual Progress Comparison */}
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Current Readiness</span>
              <span className="font-medium text-[var(--foreground)]">{currentReadiness}%</span>
            </div>
            <Progress value={currentReadiness} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Potential Readiness</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {potentialReadiness}%
              </span>
            </div>
            <Progress value={potentialReadiness} className="h-2 [&>div]:bg-blue-600" />
          </div>
        </div>

        {/* Opportunities */}
        {estimatedPotentialGain > 0 && (
          <div className="space-y-3 pt-4 border-t border-[var(--border)]">
            <h4 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Target className="h-4 w-4" />
              Improvement Opportunities
            </h4>

            <div className="space-y-2 text-sm">
              {mockExamGap > 0 && (
                <div className="flex items-start gap-2 p-3 bg-[var(--accent)] rounded-md">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      Take {3 - readiness.mockExamsTaken} more mock exam(s)
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      Potential gain: up to +{mockExamGap.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}

              {reviewGap > 0 && (
                <div className="flex items-start gap-2 p-3 bg-[var(--accent)] rounded-md">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      Complete daily review sessions
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      Potential gain: up to +{reviewGap.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}

              {consistencyGap > 0 && (
                <div className="flex items-start gap-2 p-3 bg-[var(--accent)] rounded-md">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      Build consistent study habits
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      Potential gain: up to +{consistencyGap.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ceiling Info */}
        <div className="text-xs text-[var(--muted)] text-center p-3 bg-[var(--accent)] rounded-md">
          <strong className="text-[var(--foreground)]">Maximum Ceiling:</strong> {readinessCeiling}%
          {readinessCeiling < 100 && (
            <span className="block mt-1">
              Complete more curriculum content to raise your ceiling
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}