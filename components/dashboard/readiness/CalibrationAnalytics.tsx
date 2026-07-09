"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CETReadiness } from "@/types/dashboard";
import { Target, CheckCircle, Clock, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CalibrationAnalyticsProps {
  readiness: CETReadiness;
}

export function CalibrationAnalytics({ readiness }: CalibrationAnalyticsProps) {
  const { isCalibrated, mockExamsTaken } = readiness;
  
  const mockExamsRequired = 3;
  const mockExamsRemaining = Math.max(0, mockExamsRequired - mockExamsTaken);
  const calibrationProgress = Math.min(100, (mockExamsTaken / mockExamsRequired) * 100);
  
  // Calculate estimated metrics
  const estimatedTimePerExam = 90; // 90 minutes per mock exam
  const estimatedTimeRemaining = mockExamsRemaining * estimatedTimePerExam;
  const estimatedHours = Math.floor(estimatedTimeRemaining / 60);
  const estimatedMinutes = estimatedTimeRemaining % 60;
  
  // Calculate expected improvement after calibration
  const currentScore = readiness.overallScore;
  const expectedImprovement = isCalibrated ? 0 : Math.min(15, mockExamsRemaining * 5);
  const projectedScore = Math.min(100, currentScore + expectedImprovement);

  if (isCalibrated) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Calibration Status
          </h3>
          <p className="text-sm text-[var(--muted)] mt-1">
            Your readiness system calibration progress
          </p>
        </div>

        {/* Calibrated Status */}
        <Card className="p-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                Fully Calibrated
              </h4>
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">
                Congratulations! Your readiness system is fully calibrated. Your readiness predictions are now highly reliable and accurate. The system has sufficient data to provide personalized insights.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {mockExamsTaken}
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-1">
                    Mock Exams
                  </div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    100%
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-1">
                    Calibration
                  </div>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    High
                  </div>
                  <div className="text-xs text-[var(--muted)] mt-1">
                    Reliability
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Benefits */}
        <Card className="p-6">
          <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">
            Calibration Benefits
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-[var(--foreground)]">Accurate Predictions</p>
                <p className="text-[var(--muted)] text-xs mt-0.5">
                  Your readiness score accurately reflects your exam preparedness
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-[var(--foreground)]">Personalized Insights</p>
                <p className="text-[var(--muted)] text-xs mt-0.5">
                  AI-powered recommendations tailored to your learning patterns
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-[var(--foreground)]">Reliable Trends</p>
                <p className="text-[var(--muted)] text-xs mt-0.5">
                  Track your progress with confidence in the accuracy
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-[var(--foreground)]">Strategic Planning</p>
                <p className="text-[var(--muted)] text-xs mt-0.5">
                  Make informed decisions about your study strategy
                </p>
              </div>
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
          Calibration Progress
        </h3>
        <p className="text-sm text-[var(--muted)] mt-1">
          Complete calibration to unlock accurate readiness predictions
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="p-6 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
            <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                Calibration in Progress
              </h4>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                You're {mockExamsTaken} of {mockExamsRequired} mock exams toward full calibration. Complete {mockExamsRemaining} more to unlock accurate readiness predictions and personalized insights.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--muted)]">Progress</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {mockExamsTaken} / {mockExamsRequired} mock exams
                </span>
              </div>
              <Progress value={calibrationProgress} className="h-3" />
              <p className="text-xs text-[var(--muted)] text-right">
                {calibrationProgress.toFixed(0)}% complete
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h4 className="text-sm font-semibold text-[var(--foreground)]">
              Requirements
            </h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Mock Exams</span>
              <span className={`font-bold ${
                mockExamsTaken >= mockExamsRequired ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
              }`}>
                {mockExamsTaken}/{mockExamsRequired}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Remaining</span>
              <span className="font-bold text-[var(--foreground)]">
                {mockExamsRemaining}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h4 className="text-sm font-semibold text-[var(--foreground)]">
              Estimated Time
            </h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Per Exam</span>
              <span className="font-bold text-[var(--foreground)]">
                ~{estimatedTimePerExam} min
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Remaining</span>
              <span className="font-bold text-[var(--foreground)]">
                ~{estimatedHours}h {estimatedMinutes}m
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h4 className="text-sm font-semibold text-[var(--foreground)]">
              Expected Gain
            </h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">Current</span>
              <span className="font-bold text-[var(--foreground)]">
                {currentScore}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)]">After Calibration</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                ~{projectedScore}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Steps */}
      <Card className="p-6">
        <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          How to Complete Calibration
        </h4>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--foreground)] mb-1">
                Take Mock Exams
              </p>
              <p className="text-xs text-[var(--muted)] mb-2">
                Complete {mockExamsRemaining} more full-length mock exam(s) under realistic test conditions.
              </p>
              <Link href="/exam">
                <Button size="sm" variant="outline">
                  <Target className="h-3 w-3 mr-1" />
                  Start Mock Exam
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--foreground)] mb-1">
                Answer Honestly
              </p>
              <p className="text-xs text-[var(--muted)]">
                Don't look up answers or skip difficult questions. Accurate data leads to accurate predictions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">3</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--foreground)] mb-1">
                Automatic Calibration
              </p>
              <p className="text-xs text-[var(--muted)]">
                Once you complete {mockExamsRequired} mock exams, the system will automatically calibrate and unlock full features.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Unlock Features */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">
          Features to Unlock
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <span className="text-[var(--muted)]">Accurate readiness predictions</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <span className="text-[var(--muted)]">Personalized AI insights</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <span className="text-[var(--muted)]">Reliable trend analysis</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <span className="text-[var(--muted)]">Strategic study recommendations</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <span className="text-[var(--muted)]">Confidence scoring</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <span className="text-[var(--muted)]">Advanced analytics</span>
          </div>
        </div>
      </Card>
    </div>
  );
}