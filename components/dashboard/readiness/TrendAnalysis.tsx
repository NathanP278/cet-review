"use client";

import { Card } from "@/components/ui/card";
import type { CETReadiness } from "@/types/dashboard";
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, Info } from "lucide-react";

interface TrendAnalysisProps {
  readiness: CETReadiness;
}

interface TrendInsight {
  type: 'improving' | 'stable' | 'declining' | 'rapid_improvement' | 'plateau' | 'regression';
  title: string;
  description: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  recommendations: string[];
  metrics: {
    label: string;
    value: string;
  }[];
}

export function TrendAnalysis({ readiness }: TrendAnalysisProps) {
  // Analyze trend based on actual metrics
  const analyzeTrend = (): TrendInsight => {
    const { trend, breakdown, mockExamsTaken, overallScore } = readiness;
    
    // Calculate velocity (rate of improvement)
    const mockExamProgress = mockExamsTaken >= 3;
    const consistencyScore = breakdown?.consistency || 0;
    const memoryScore = breakdown?.memoryRetention || 0;
    
    // Rapid improvement detection
    if (trend === 'improving' && overallScore > 75 && mockExamsTaken >= 2) {
      return {
        type: 'rapid_improvement',
        title: 'Excellent Progress - Rapid Improvement Detected',
        description: 'Your readiness is improving faster than average. Your consistent study habits and strong mock exam performance are driving significant gains. This trend suggests you\'re building solid exam readiness.',
        severity: 'success',
        recommendations: [
          'Maintain your current study schedule',
          'Continue taking mock exams regularly',
          'Focus on reinforcing weak areas identified in practice',
        ],
        metrics: [
          { label: 'Improvement Rate', value: 'Above Average' },
          { label: 'Consistency', value: `${consistencyScore}/8` },
          { label: 'Trajectory', value: 'Accelerating' },
        ],
      };
    }
    
    // Plateau detection
    if (trend === 'stable' && overallScore < 80 && mockExamsTaken >= 3) {
      return {
        type: 'plateau',
        title: 'Plateau Detected - Time to Push Through',
        description: 'Your readiness has stabilized but hasn\'t improved significantly recently. This is normal at this stage. To break through, you need to identify and address specific weak areas or increase study intensity.',
        severity: 'warning',
        recommendations: [
          'Take a diagnostic mock exam to identify weak subjects',
          'Increase daily review completion to clear overdue cards',
          'Focus on subjects with lowest readiness scores',
          'Vary your study methods to maintain engagement',
        ],
        metrics: [
          { label: 'Plateau Duration', value: '~7-14 days' },
          { label: 'Current Score', value: `${overallScore}%` },
          { label: 'Potential Gain', value: `+${Math.round((90 - overallScore) * 0.6)}%` },
        ],
      };
    }
    
    // Regression detection
    if (trend === 'declining' || (breakdown && breakdown.consistency < 4)) {
      return {
        type: 'regression',
        title: 'Declining Trend - Immediate Action Required',
        description: 'Your readiness is declining, likely due to reduced study consistency or neglecting review sessions. Memory retention naturally decays without regular practice. You need to re-establish consistent study habits.',
        severity: 'error',
        recommendations: [
          'Resume daily review sessions immediately',
          'Clear all overdue flashcards',
          'Schedule dedicated study blocks',
          'Take a fresh mock exam to re-calibrate',
          'Review fundamentals in weak subjects',
        ],
        metrics: [
          { label: 'Consistency', value: `${consistencyScore}/8 (Low)` },
          { label: 'Memory Retention', value: `${memoryScore}/15` },
          { label: 'Action Needed', value: 'Urgent' },
        ],
      };
    }
    
    // Standard improving
    if (trend === 'improving') {
      return {
        type: 'improving',
        title: 'Steady Improvement - On Track',
        description: 'Your readiness is steadily improving through consistent effort. You\'re making good progress across multiple dimensions. Continue your current approach while addressing any weak areas.',
        severity: 'success',
        recommendations: [
          'Keep up your consistent study schedule',
          'Complete daily reviews on time',
          'Take another mock exam when ready',
          'Review mistakes and learn from them',
        ],
        metrics: [
          { label: 'Progress', value: 'Positive' },
          { label: 'Mock Exams', value: `${mockExamsTaken}` },
          { label: 'Trajectory', value: 'Improving' },
        ],
      };
    }
    
    // Stable/neutral
    return {
      type: 'stable',
      title: 'Stable Progress - Consistent Performance',
      description: 'Your readiness is stable, maintaining your current level. You\'re doing well but there\'s room to accelerate progress by increasing study intensity or addressing specific weak areas.',
      severity: 'info',
      recommendations: [
        'Maintain consistency in daily reviews',
        'Identify and target weak subjects',
        'Consider increasing study time gradually',
        'Take regular mock exams for calibration',
      ],
      metrics: [
        { label: 'Stability', value: 'High' },
        { label: 'Current Level', value: `${overallScore}%` },
        { label: 'Status', value: 'Maintaining' },
      ],
    };
  };

  const insight = analyzeTrend();

  const getIcon = () => {
    switch (insight.type) {
      case 'rapid_improvement':
        return <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />;
      case 'improving':
        return <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
      case 'plateau':
        return <Minus className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />;
      case 'regression':
        return <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />;
      default:
        return <Info className="h-6 w-6 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getColor = () => {
    switch (insight.severity) {
      case 'success':
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950';
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950';
      case 'error':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950';
      default:
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          Trend Analysis
        </h3>
        <p className="text-sm text-[var(--muted)] mt-1">
          Intelligent analysis of your readiness progression
        </p>
      </div>

      {/* Main Insight Card */}
      <Card className={`p-6 ${getColor()}`}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {getIcon()}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                {insight.title}
              </h4>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {insight.description}
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]">
            {insight.metrics.map((metric, i) => (
              <div key={i} className="text-center">
                <div className="text-xs text-[var(--muted)] mb-1">
                  {metric.label}
                </div>
                <div className="text-sm font-bold text-[var(--foreground)]">
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6">
        <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Recommended Actions
        </h4>
        <div className="space-y-3">
          {insight.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
                  <span className="text-xs font-medium text-[var(--foreground)]">
                    {i + 1}
                  </span>
                </div>
              </div>
              <p className="text-sm text-[var(--muted)] flex-1">
                {rec}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Contributing Factors */}
      {readiness.breakdown && (
        <Card className="p-6">
          <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">
            Contributing Factors
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Mock Exam Performance</span>
              <span className={`font-medium ${
                readiness.breakdown.mockExams > 20 ? 'text-green-600 dark:text-green-400' :
                readiness.breakdown.mockExams > 10 ? 'text-blue-600 dark:text-blue-400' :
                'text-yellow-600 dark:text-yellow-400'
              }`}>
                {readiness.breakdown.mockExams > 20 ? 'Strong' : 
                 readiness.breakdown.mockExams > 10 ? 'Moderate' : 'Weak'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Study Consistency</span>
              <span className={`font-medium ${
                readiness.breakdown.consistency > 6 ? 'text-green-600 dark:text-green-400' :
                readiness.breakdown.consistency > 4 ? 'text-blue-600 dark:text-blue-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {readiness.breakdown.consistency > 6 ? 'Excellent' : 
                 readiness.breakdown.consistency > 4 ? 'Good' : 'Needs Improvement'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Memory Retention</span>
              <span className={`font-medium ${
                readiness.breakdown.memoryRetention > 10 ? 'text-green-600 dark:text-green-400' :
                readiness.breakdown.memoryRetention > 5 ? 'text-blue-600 dark:text-blue-400' :
                'text-yellow-600 dark:text-yellow-400'
              }`}>
                {readiness.breakdown.memoryRetention > 10 ? 'Strong' : 
                 readiness.breakdown.memoryRetention > 5 ? 'Moderate' : 'Developing'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Review Completion</span>
              <span className={`font-medium ${
                readiness.breakdown.reviewCompletion > 3 ? 'text-green-600 dark:text-green-400' :
                readiness.breakdown.reviewCompletion > 1 ? 'text-blue-600 dark:text-blue-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {readiness.breakdown.reviewCompletion > 3 ? 'On Track' : 
                 readiness.breakdown.reviewCompletion > 1 ? 'Fair' : 'Behind'}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}