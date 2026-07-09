"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CETReadiness } from "@/types/dashboard";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Target,
  BookOpen,
  Calendar,
  TrendingUp
} from "lucide-react";

interface ConfidenceAnalysisProps {
  readiness: CETReadiness;
}

interface ConfidenceFactor {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'insufficient';
  icon: typeof Shield;
  description: string;
}

export function ConfidenceAnalysis({ readiness }: ConfidenceAnalysisProps) {
  // Calculate confidence factors
  const factors: ConfidenceFactor[] = [
    {
      name: 'Sample Size',
      score: readiness.mockExamsTaken + Math.floor((readiness.breakdown?.practiceQuizzes || 0) / 2),
      maxScore: 10,
      weight: 30,
      status: readiness.mockExamsTaken >= 3 ? 'excellent' : readiness.mockExamsTaken >= 2 ? 'good' : 'needs_improvement',
      icon: Target,
      description: 'Number of assessments completed (mock exams and quizzes)',
    },
    {
      name: 'Subject Coverage',
      score: Math.min(10, (readiness.breakdown?.subjectMastery || 0) / 2.5),
      maxScore: 10,
      weight: 25,
      status: (readiness.breakdown?.subjectMastery || 0) > 20 ? 'excellent' : 
              (readiness.breakdown?.subjectMastery || 0) > 15 ? 'good' : 'needs_improvement',
      icon: BookOpen,
      description: 'Coverage across all exam subjects and topics',
    },
    {
      name: 'Review Volume',
      score: Math.min(10, (readiness.breakdown?.memoryRetention || 0) / 1.5),
      maxScore: 10,
      weight: 20,
      status: (readiness.breakdown?.memoryRetention || 0) > 10 ? 'excellent' :
              (readiness.breakdown?.memoryRetention || 0) > 5 ? 'good' : 'needs_improvement',
      icon: Calendar,
      description: 'Volume of completed spaced repetition reviews',
    },
    {
      name: 'Calibration Status',
      score: readiness.isCalibrated ? 10 : Math.min(10, readiness.mockExamsTaken * 3.3),
      maxScore: 10,
      weight: 15,
      status: readiness.isCalibrated ? 'excellent' : 
              readiness.mockExamsTaken >= 2 ? 'good' : 'needs_improvement',
      icon: Shield,
      description: 'Whether the readiness system is fully calibrated',
    },
    {
      name: 'Data Recency',
      score: 8, // Simplified - in production, calculate based on last activity
      maxScore: 10,
      weight: 10,
      status: 'good',
      icon: TrendingUp,
      description: 'How recent your assessment data is',
    },
  ];

  // Calculate overall confidence score
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  const weightedScore = factors.reduce((sum, f) => 
    sum + ((f.score / f.maxScore) * f.weight), 0
  );
  const overallConfidence = (weightedScore / totalWeight) * 100;

  // Determine overall confidence level
  const getConfidenceLevel = (score: number): {
    level: 'High' | 'Medium' | 'Low' | 'Insufficient Data';
    color: string;
    icon: typeof CheckCircle2;
    description: string;
  } => {
    if (score >= 80) {
      return {
        level: 'High',
        color: 'text-green-600 dark:text-green-400',
        icon: CheckCircle2,
        description: 'Your readiness prediction is highly reliable. You have sufficient data across multiple dimensions for accurate prediction.',
      };
    } else if (score >= 60) {
      return {
        level: 'Medium',
        color: 'text-blue-600 dark:text-blue-400',
        icon: Shield,
        description: 'Your readiness prediction is moderately reliable. More data will improve prediction accuracy.',
      };
    } else if (score >= 30) {
      return {
        level: 'Low',
        color: 'text-yellow-600 dark:text-yellow-400',
        icon: AlertTriangle,
        description: 'Your readiness prediction has limited reliability. Significant more data is needed for accurate predictions.',
      };
    } else {
      return {
        level: 'Insufficient Data',
        color: 'text-red-600 dark:text-red-400',
        icon: AlertTriangle,
        description: 'Insufficient data for reliable readiness prediction. Complete more assessments to establish baseline.',
      };
    }
  };

  const confidenceInfo = getConfidenceLevel(overallConfidence);
  const ConfidenceIcon = confidenceInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          Confidence Analysis
        </h3>
        <p className="text-sm text-[var(--muted)] mt-1">
          How reliable is your readiness prediction?
        </p>
      </div>

      {/* Overall Confidence */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full bg-[var(--accent)]`}>
            <ConfidenceIcon className={`h-6 w-6 ${confidenceInfo.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-3 mb-2">
              <h4 className="text-2xl font-bold text-[var(--foreground)]">
                {overallConfidence.toFixed(0)}%
              </h4>
              <span className={`text-sm font-semibold ${confidenceInfo.color}`}>
                {confidenceInfo.level} Confidence
              </span>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {confidenceInfo.description}
            </p>
            <div className="mt-4">
              <Progress value={overallConfidence} className="h-2" />
            </div>
          </div>
        </div>
      </Card>

      {/* Confidence Factors */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-[var(--foreground)]">
          Confidence Factors
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {factors.map((factor) => {
            const FactorIcon = factor.icon;
            const percentage = (factor.score / factor.maxScore) * 100;
            
            return (
              <Card key={factor.name} className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FactorIcon className="h-4 w-4 text-[var(--muted)]" />
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {factor.name}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--muted)]">
                      {factor.weight}% weight
                    </span>
                  </div>

                  {/* Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--muted)]">
                        {factor.score.toFixed(1)} / {factor.maxScore}
                      </span>
                      <span className={`font-medium ${
                        factor.status === 'excellent' ? 'text-green-600 dark:text-green-400' :
                        factor.status === 'good' ? 'text-blue-600 dark:text-blue-400' :
                        factor.status === 'needs_improvement' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {factor.status === 'excellent' ? 'Excellent' :
                         factor.status === 'good' ? 'Good' :
                         factor.status === 'needs_improvement' ? 'Needs Improvement' :
                         'Insufficient'}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[var(--muted)]">
                    {factor.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Prediction Reliability */}
      <Card className="p-6">
        <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          What This Means
        </h4>
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-[var(--foreground)] mb-1">
                High Confidence (80%+)
              </p>
              <p className="text-[var(--muted)]">
                Readiness predictions are highly accurate. You have comprehensive data across all key areas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-[var(--foreground)] mb-1">
                Medium Confidence (60-79%)
              </p>
              <p className="text-[var(--muted)]">
                Predictions are reasonably reliable but would benefit from more data points.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="font-medium text-[var(--foreground)] mb-1">
                Low Confidence (<60%)
              </p>
              <p className="text-[var(--muted)]">
                Predictions should be treated as preliminary. More assessments are needed.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Improvement Actions */}
      {overallConfidence < 80 && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">
            How to Improve Confidence
          </h4>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            {readiness.mockExamsTaken < 3 && (
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Take more mock exams (currently {readiness.mockExamsTaken}/3)</span>
              </li>
            )}
            {(readiness.breakdown?.subjectMastery || 0) < 20 && (
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Cover more subjects and topics</span>
              </li>
            )}
            {(readiness.breakdown?.memoryRetention || 0) < 10 && (
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Complete more spaced repetition reviews</span>
              </li>
            )}
            {!readiness.isCalibrated && (
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Achieve full calibration status</span>
              </li>
            )}
          </ul>
        </Card>
      )}
    </div>
  );
}