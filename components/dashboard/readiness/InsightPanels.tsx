"use client";

import { Card } from "@/components/ui/card";
import type { CETReadiness } from "@/types/dashboard";
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Brain,
  BookOpen,
  Calendar
} from "lucide-react";

interface InsightPanelsProps {
  readiness: CETReadiness;
}

interface Insight {
  id: string;
  type: 'strength' | 'opportunity' | 'warning' | 'achievement';
  title: string;
  description: string;
  icon: typeof Lightbulb;
  color: string;
  bgColor: string;
  priority: number;
}

export function InsightPanels({ readiness }: InsightPanelsProps) {
  // Generate dynamic insights based on actual metrics
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    const { breakdown, trend, overallScore, mockExamsTaken, isCalibrated } = readiness;

    if (!breakdown) return insights;

    // Memory vs Knowledge comparison
    const memoryScore = breakdown.memoryRetention;
    const knowledgeScore = breakdown.subjectMastery;
    if (memoryScore > knowledgeScore + 5) {
      insights.push({
        id: 'memory-stronger',
        type: 'strength',
        title: 'Memory Stronger Than Knowledge',
        description: `Your memory retention (${memoryScore}/15) is outpacing your subject mastery (${knowledgeScore}/25). You're excellent at remembering what you study. Focus on covering more content to leverage this strength.`,
        icon: Brain,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800',
        priority: 80,
      });
    } else if (knowledgeScore * 0.6 > memoryScore + 3) {
      insights.push({
        id: 'knowledge-stronger',
        type: 'opportunity',
        title: 'Knowledge Ahead of Memory',
        description: `Your subject mastery (${knowledgeScore}/25) is higher than your memory retention (${memoryScore}/15). You're learning quickly but need to reinforce through reviews to improve retention.`,
        icon: BookOpen,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
        priority: 75,
      });
    }

    // Mock exam performance
    if (breakdown.mockExams < 10 && mockExamsTaken >= 1) {
      insights.push({
        id: 'mock-exams-limiting',
        type: 'warning',
        title: 'Mock Exams Limiting Your Readiness',
        description: `Your mock exam score (${breakdown.mockExams}/30) is holding back your overall readiness. Mock exams are weighted heavily. Taking ${3 - mockExamsTaken} more mock exam(s) could increase your readiness by 10-15%.`,
        icon: Target,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800',
        priority: 90,
      });
    } else if (breakdown.mockExams >= 20) {
      insights.push({
        id: 'mock-exam-strength',
        type: 'strength',
        title: 'Excellent Mock Exam Performance',
        description: `Your mock exam score (${breakdown.mockExams}/30) is strong. You perform well under test conditions. This suggests good exam readiness and time management skills.`,
        icon: Target,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
        priority: 70,
      });
    }

    // Review completion issues
    if (breakdown.reviewCompletion < 3) {
      insights.push({
        id: 'review-completion-low',
        type: 'warning',
        title: 'Review Completion Has Plateaued',
        description: `You're completing only ${breakdown.reviewCompletion}/5 of your scheduled reviews. Overdue cards are accumulating, which hurts retention. Set aside 15-20 minutes daily to clear your review queue.`,
        icon: Calendar,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
        priority: 85,
      });
    }

    // Consistency insights
    if (breakdown.consistency >= 7) {
      insights.push({
        id: 'consistency-achievement',
        type: 'achievement',
        title: 'Outstanding Study Consistency',
        description: `Your consistency score (${breakdown.consistency}/8) is excellent. You're maintaining regular study habits, which is the foundation of long-term success. Keep it up!`,
        icon: TrendingUp,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
        priority: 60,
      });
    } else if (breakdown.consistency < 4) {
      insights.push({
        id: 'consistency-declining',
        type: 'warning',
        title: 'Consistency Needs Improvement',
        description: `Your consistency score (${breakdown.consistency}/8) indicates irregular study patterns. Memory retention suffers without consistent practice. Try studying at the same time each day.`,
        icon: TrendingDown,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
        priority: 88,
      });
    }

    // Trend-based insights
    if (trend === 'improving' && overallScore > 70) {
      insights.push({
        id: 'momentum-building',
        type: 'achievement',
        title: 'Strong Upward Momentum',
        description: `Your readiness improved ${Math.floor((overallScore - 60) / 2)}% recently. You're on an excellent trajectory. Maintain your current approach and you'll be exam-ready soon.`,
        icon: TrendingUp,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
        priority: 65,
      });
    }

    // Calibration achievement
    if (isCalibrated && mockExamsTaken === 3) {
      insights.push({
        id: 'newly-calibrated',
        type: 'achievement',
        title: 'System Calibrated',
        description: `You've completed ${mockExamsTaken} mock exams and your readiness predictions are now fully calibrated. All analytics features are unlocked.`,
        icon: Lightbulb,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
        priority: 95,
      });
    }

    // Learning velocity
    if (breakdown.learningVelocity >= 2.5) {
      insights.push({
        id: 'fast-learner',
        type: 'strength',
        title: 'Rapid Learning Pace',
        description: `Your learning velocity (${breakdown.learningVelocity.toFixed(1)}/3) is high. You're mastering new material quickly. Consider taking on more challenging content.`,
        icon: Brain,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800',
        priority: 55,
      });
    }

    // Sort by priority (highest first) and limit to top 6
    return insights.sort((a, b) => b.priority - a.priority).slice(0, 6);
  };

  const insights = generateInsights();

  if (insights.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            AI Insights
          </h3>
          <p className="text-sm text-[var(--muted)] mt-1">
            Personalized insights based on your study patterns
          </p>
        </div>

        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="p-4 rounded-full bg-[var(--accent)]">
              <Lightbulb className="h-8 w-8 text-[var(--muted)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)] mb-2">
                Keep Studying to Generate Insights
              </p>
              <p className="text-xs text-[var(--muted)]">
                Complete more activities to unlock AI-powered insights about your progress
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          AI Insights
        </h3>
        <p className="text-sm text-[var(--muted)] mt-1">
          Personalized insights generated from your study patterns
        </p>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => {
          const Icon = insight.icon;

          return (
            <Card
              key={insight.id}
              className={`p-5 ${insight.bgColor} transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${insight.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Type Badge */}
                  <div className="mb-2">
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                        insight.type === 'strength'
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : insight.type === 'opportunity'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : insight.type === 'warning'
                          ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                          : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      {insight.type === 'strength'
                        ? 'Strength'
                        : insight.type === 'opportunity'
                        ? 'Opportunity'
                        : insight.type === 'warning'
                        ? 'Action Needed'
                        : 'Achievement'}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-semibold text-[var(--foreground)] mb-2">
                    {insight.title}
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Insight Count */}
      <div className="text-center">
        <p className="text-xs text-[var(--muted)]">
          Showing {insights.length} {insights.length === 1 ? 'insight' : 'insights'} based on your current data
        </p>
      </div>
    </div>
  );
}