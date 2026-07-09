"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Target, 
  Brain,
  TrendingUp,
  Shield,
  Calculator,
  CheckCircle
} from "lucide-react";

export function ReadinessExplainer() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'what-is-readiness',
      title: 'What is Readiness?',
      icon: Lightbulb,
      content: (
        <div className="space-y-4 text-sm text-[var(--muted)]">
          <p>
            Readiness is a predictive score (0-100%) that estimates how prepared you are for your College Entrance Test. It combines multiple dimensions of your preparation into a single, actionable metric.
          </p>
          <p>
            Unlike a simple average of quiz scores, readiness considers the quality of your practice, memory retention, study consistency, and mock exam performance to predict your actual exam-day performance.
          </p>
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Key Point
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              A 75% readiness score means you have a strong foundation and are likely to perform well, but there's still room for improvement. An 85%+ score indicates you're highly prepared.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'how-calculated',
      title: 'How is Readiness Calculated?',
      icon: Calculator,
      content: (
        <div className="space-y-4 text-sm text-[var(--muted)]">
          <p>
            Readiness is calculated using a weighted formula across 9 dimensions. Each dimension contributes based on its importance to exam success:
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-[var(--accent)] rounded-md">
              <span>Mock Exams (30%)</span>
              <span className="font-semibold text-[var(--foreground)]">Highest Weight</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--accent)] rounded-md">
              <span>Subject Mastery (25%)</span>
              <span className="font-semibold text-[var(--foreground)]">High Weight</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--accent)] rounded-md">
              <span>Memory Retention (15%)</span>
              <span className="font-semibold text-[var(--foreground)]">Medium Weight</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[var(--accent)] rounded-md">
              <span>Practice Quizzes (10%)</span>
              <span className="font-semibold text-[var(--foreground)]">Medium Weight</span>
            </div>
            <div className="text-xs text-center py-2">
              + 5 more dimensions (Consistency, Reviews, Velocity, Time, Confidence)
            </div>
          </div>
          <p className="text-xs">
            The formula: <code className="px-2 py-1 bg-[var(--accent)] rounded font-mono">Readiness = Σ(Dimension Score × Weight) / Total Weight</code>
          </p>
        </div>
      ),
    },
    {
      id: 'nine-dimensions',
      title: 'The 9 Dimensions Explained',
      icon: Target,
      content: (
        <div className="space-y-3 text-sm text-[var(--muted)]">
          <div className="p-3 bg-[var(--accent)] rounded-md">
            <p className="font-semibold text-[var(--foreground)] mb-1">1. Mock Exams (30 points)</p>
            <p className="text-xs">Full-length practice tests that simulate real exam conditions. Your performance here is the strongest predictor of actual results.</p>
          </div>
          <div className="p-3 bg-[var(--accent)] rounded-md">
            <p className="font-semibold text-[var(--foreground)] mb-1">2. Subject Mastery (25 points)</p>
            <p className="text-xs">How well you understand each subject. Measured through quiz performance and topic completion across all exam subjects.</p>
          </div>
          <div className="p-3 bg-[var(--accent)] rounded-md">
            <p className="font-semibold text-[var(--foreground)] mb-1">3. Memory Retention (15 points)</p>
            <p className="text-xs">Your ability to recall information over time. Tracked through the SM-2 spaced repetition algorithm based on flashcard reviews.</p>
          </div>
          <div className="p-3 bg-[var(--accent)] rounded-md">
            <p className="font-semibold text-[var(--foreground)] mb-1">4. Practice Quizzes (10 points)</p>
            <p className="text-xs">Performance on topic-specific practice questions. Helps identify strengths and weaknesses before attempting full mock exams.</p>
          </div>
          <div className="p-3 bg-[var(--accent)] rounded-md">
            <p className="font-semibold text-[var(--foreground)] mb-1">5. Consistency (8 points)</p>
            <p className="text-xs">Regular study habits measured by active days, streaks, and activity patterns. Consistent practice leads to better retention.</p>
          </div>
          <div className="p-3 bg-[var(--accent)] rounded-md">
            <p className="font-semibold text-[var(--foreground)] mb-1">6-9. Additional Factors (12 points total)</p>
            <p className="text-xs">Review completion, learning velocity, study time, and confidence contribute to your overall readiness score.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'confidence-works',
      title: 'How Confidence Works',
      icon: Shield,
      content: (
        <div className="space-y-4 text-sm text-[var(--muted)]">
          <p>
            Confidence measures how reliable your readiness prediction is. It's based on the amount and quality of data available:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[var(--foreground)]">High Confidence (80%+)</p>
                <p className="text-xs mt-1">You have sufficient data across all dimensions. Predictions are highly accurate.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[var(--foreground)]">Medium Confidence (60-79%)</p>
                <p className="text-xs mt-1">Predictions are reasonably reliable but would improve with more data.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full border-2 border-yellow-600 dark:border-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[var(--foreground)]">Low Confidence (<60%)</p>
                <p className="text-xs mt-1">Limited data available. Predictions should be treated as preliminary estimates.</p>
              </div>
            </div>
          </div>
          <p className="text-xs">
            Confidence improves as you complete more mock exams, practice quizzes, and review sessions.
          </p>
        </div>
      ),
    },
    {
      id: 'predictions-work',
      title: 'How Predictions Work',
      icon: TrendingUp,
      content: (
        <div className="space-y-4 text-sm text-[var(--muted)]">
          <p>
            The readiness system uses your historical performance data to predict your exam-day score:
          </p>
          <div className="p-4 bg-[var(--accent)] rounded-md space-y-3">
            <div>
              <p className="font-semibold text-[var(--foreground)] text-xs mb-2">Step 1: Data Collection</p>
              <p className="text-xs">Your mock exam scores, quiz results, and review performance are continuously tracked.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] text-xs mb-2">Step 2: Pattern Analysis</p>
              <p className="text-xs">The system identifies trends, learning velocity, and retention patterns in your data.</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)] text-xs mb-2">Step 3: Score Prediction</p>
              <p className="text-xs">Based on your current trajectory and performance patterns, an estimated exam-day score is calculated.</p>
            </div>
          </div>
          <p>
            Predictions become more accurate as you complete more mock exams and maintain consistent study habits.
          </p>
        </div>
      ),
    },
    {
      id: 'calibration-matters',
      title: 'Why Calibration Matters',
      icon: Target,
      content: (
        <div className="space-y-4 text-sm text-[var(--muted)]">
          <p>
            Calibration is the process of fine-tuning the readiness system to your individual learning patterns and performance characteristics.
          </p>
          <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-md border border-orange-200 dark:border-orange-800">
            <p className="text-xs font-semibold text-orange-900 dark:text-orange-100 mb-2">
              Why 3 Mock Exams?
            </p>
            <p className="text-xs text-orange-700 dark:text-orange-300">
              Three full-length mock exams provide enough data to establish baseline performance, identify patterns, and account for day-to-day variation. This creates reliable predictions tailored to you.
            </p>
          </div>
          <p>
            Before calibration, readiness scores are estimates. After calibration, they're personalized predictions based on your actual performance patterns.
          </p>
          <div className="space-y-2">
            <p className="font-semibold text-[var(--foreground)]">Benefits of Calibration:</p>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li>Accurate readiness predictions</li>
              <li>Personalized AI insights</li>
              <li>Reliable trend analysis</li>
              <li>Strategic study recommendations</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'how-to-improve',
      title: 'How to Improve Your Readiness',
      icon: Brain,
      content: (
        <div className="space-y-4 text-sm text-[var(--muted)]">
          <p>
            Since readiness is multi-dimensional, there are multiple paths to improvement:
          </p>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-xs">Fast Track: Mock Exams</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Mock exams have the highest weight (30%). Improving your mock exam scores by 10% can boost readiness by 3-4%.
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800">
              <p className="font-semibold text-green-900 dark:text-green-100 mb-2 text-xs">Steady Growth: Subject Mastery</p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Complete practice quizzes and study topics systematically. Subject mastery (25% weight) builds a strong foundation.
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-md border border-purple-200 dark:border-purple-800">
              <p className="font-semibold text-purple-900 dark:text-purple-100 mb-2 text-xs">Long-term: Memory & Consistency</p>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Daily reviews and consistent study habits (23% combined weight) ensure knowledge retention over time.
              </p>
            </div>
          </div>
          <p className="text-xs">
            <strong>Pro tip:</strong> Address your weakest dimensions first for the fastest readiness gains.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          Understanding Readiness
        </h3>
        <p className="text-sm text-[var(--muted)] mt-1">
          Learn how the readiness system works
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSection === section.id;

          return (
            <Card key={section.id} className="overflow-hidden">
              <button
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-[var(--accent)] transition-colors text-left"
                aria-expanded={isExpanded}
                aria-controls={`explainer-${section.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--accent)]">
                    <Icon className="h-4 w-4 text-[var(--foreground)]" />
                  </div>
                  <span className="font-semibold text-[var(--foreground)]">
                    {section.title}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-[var(--muted)]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[var(--muted)]" />
                )}
              </button>

              {isExpanded && (
                <div
                  id={`explainer-${section.id}`}
                  className="px-4 pb-4 pt-2 border-t border-[var(--border)]"
                >
                  {section.content}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Footer Note */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Questions About Readiness?
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              The readiness system is designed to be transparent and explainable. If you have questions about how your score is calculated or how to improve it, explore the sections above or check the analytics dashboard.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}