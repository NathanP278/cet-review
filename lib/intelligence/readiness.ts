/**
 * CET Readiness Engine (F2.2)
 * 
 * A mathematically sound, production-ready scoring engine that accurately 
 * estimates a student's preparedness for college entrance examinations.
 * 
 * The score is calculated from multiple independent dimensions:
 * 30% - Mock Exam Performance
 * 25% - Subject Mastery
 * 15% - Memory Retention
 * 10% - Practice Quiz Performance
 * 8% - Consistency
 * 5% - Review Completion
 * 3% - Learning Velocity
 * 2% - Study Time
 * 2% - Confidence (Prepared for future implementation)
 */

import { createClient } from "@/lib/supabase/server";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ConfidenceLevel = "High" | "Medium" | "Low" | "Insufficient Data";
export type ReadinessTrend = "improving" | "stable" | "declining" | "unknown";

export interface ReadinessRecommendation {
  id: string;
  title: string;
  description: string;
  impact: number;
  estimatedTimeMinutes: number;
  difficulty: "Low" | "Medium" | "High";
  actionUrl: string;
  actionLabel: string;
}

export interface ReadinessMetrics {
  overallScore: number;
  confidenceScore: number;
  confidenceLevel: ConfidenceLevel;
  estimatedExamDayScore: number;
  subjectReadiness: Record<string, number>;
  trend: ReadinessTrend;
  isCalibrated: boolean;
  
  // The Three Readiness Dimensions (F2.2.5)
  dimensions: {
    knowledge: number; // 0-100
    memory: number;    // 0-100
    exam: number;      // 0-100
  };

  // Readiness Potential Engine (F2.2.5)
  potential: {
    currentReadiness: number;
    potentialReadiness: number;
    potentialGain: number;
    recommendations: ReadinessRecommendation[];
    opportunityAnalysis: {
      lostToOverdueReviews: number;
      lostToWeakRetention: number;
      lostToInconsistency: number;
      lostToLowMockExposure: number;
      lostToUnfinishedTopics: number;
    };
  };
  
  // Detailed breakdown for transparency
  breakdown: {
    mockExams: number;      // out of 30
    subjectMastery: number; // out of 25
    memoryRetention: number;// out of 15
    practiceQuizzes: number;// out of 10
    consistency: number;    // out of 8
    reviewCompletion: number;// out of 5
    learningVelocity: number;// out of 3
    studyTime: number;      // out of 2
    confidence: number;     // out of 2
  };
  
  // Raw metrics for insights
  rawMetrics: {
    mockExamsTaken: number;
    totalQuestionsAnswered: number;
    daysActive: number;
  };
}

// Subject importance weights for CETs (Math, Science, English, Reading Comprehension usually dominate)
const SUBJECT_WEIGHTS: Record<string, number> = {
  "math": 1.2,
  "science": 1.2,
  "english": 1.1,
  "reading_comprehension": 1.1,
  "abstract_reasoning": 1.0,
  "filipino": 0.8,
  "general_knowledge": 0.6,
  "default": 1.0
};

// ============================================================================
// MAIN CALCULATION ENGINE
// ============================================================================

export async function calculateReadiness(userId: string): Promise<ReadinessMetrics> {
  const supabase = await createClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Fetch all required data in parallel
  const [
    { data: mockExams },
    { data: quizzes },
    { data: userCards },
    { data: reviewHistory },
    { data: subjectMasteries },
    { data: profile }
  ] = await Promise.all([
    // Mock Exams (Completed only, ordered by newest)
    supabase.from("mock_exam_attempts")
      .select("id, score_data, created_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false }),
      
    // Quizzes (Completed only, ordered by newest)
    supabase.from("quiz_attempts")
      .select("id, score, total, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
      
    // SM-2 Memory Cards
    supabase.from("user_cards")
      .select("state, retention_score, ease_factor, next_review, reviews_count, lapses_count")
      .eq("user_id", userId),
      
    // Review History (Last 30 days for consistency/velocity)
    supabase.from("review_history")
      .select("reviewed_at, rating, response_time_seconds")
      .eq("user_id", userId)
      .gte("reviewed_at", thirtyDaysAgo)
      .order("reviewed_at", { ascending: false }),
      
    // Subject Mastery
    supabase.from("subject_mastery_analytics_view")
      .select("subject_id, subject_name, mastery_percentage, total_questions_attempted")
      .eq("user_id", userId),
      
    // User Profile (for streak)
    supabase.from("profiles")
      .select("streak, created_at")
      .eq("id", userId)
      .single()
  ]);

  // 2. Calculate Data Volume & Calibration Status
  const totalQuestionsAnswered = 
    (quizzes?.reduce((sum, q) => sum + (q.total || 0), 0) || 0) + 
    (mockExams?.reduce((sum, m) => {
      const data = m.score_data as any;
      return sum + (data?.totalQuestions || 0);
    }, 0) || 0);

  const totalReviews = reviewHistory?.length || 0;
  const mockExamsTaken = mockExams?.length || 0;
  
  // Calibration thresholds
  const isCalibrated = totalQuestionsAnswered >= 50 || totalReviews >= 100 || mockExamsTaken >= 1;

  if (!isCalibrated) {
    return generateUncalibratedMetrics(mockExamsTaken, totalQuestionsAnswered);
  }

  // 3. Calculate Independent Dimensions
  
  // Dimension 1: Mock Exam Performance (Max 30 points)
  const mockExamScore = calculateMockExamScore(mockExams || [], now);
  
  // Dimension 2: Subject Mastery (Max 25 points)
  const { subjectMasteryScore, subjectReadiness } = calculateSubjectMasteryScore(subjectMasteries || []);
  
  // Dimension 3: Memory Retention (Max 15 points)
  const memoryRetentionScore = calculateMemoryRetentionScore(userCards || [], now);
  
  // Dimension 4: Practice Quiz Performance (Max 10 points)
  const practiceQuizScore = calculatePracticeQuizScore(quizzes || [], now);
  
  // Dimension 5: Consistency (Max 8 points)
  const consistencyScore = calculateConsistencyScore(reviewHistory || [], profile?.streak || 0, now);
  
  // Dimension 6: Review Completion (Max 5 points)
  const reviewCompletionScore = calculateReviewCompletionScore(userCards || [], reviewHistory || [], now);
  
  // Dimension 7: Learning Velocity (Max 3 points)
  const learningVelocityScore = calculateLearningVelocityScore(quizzes || [], reviewHistory || [], thirtyDaysAgo, sevenDaysAgo);
  
  // Dimension 8: Study Time (Max 2 points)
  const studyTimeScore = calculateStudyTimeScore(reviewHistory || [], quizzes || [], mockExams || []);
  
  // Dimension 9: Confidence (Max 2 points) - Prepared for future
  const confidenceDimensionScore = 1.0; // Default to 50% of the 2 points until implemented

  // 4. Aggregate Final Score
  const rawOverallScore = 
    mockExamScore + 
    subjectMasteryScore + 
    memoryRetentionScore + 
    practiceQuizScore + 
    consistencyScore + 
    reviewCompletionScore + 
    learningVelocityScore + 
    studyTimeScore + 
    confidenceDimensionScore;

  // Ensure strict bounds (0-100)
  const overallScore = Math.max(0, Math.min(Math.round(rawOverallScore), 100));

  // 5. Calculate Statistical Confidence Level
  const { confidenceScore, confidenceLevel } = calculateStatisticalConfidence(
    mockExamsTaken,
    totalQuestionsAnswered,
    totalReviews,
    userCards?.length || 0,
    profile?.created_at || now.toISOString(),
    now
  );

  // 6. Calculate Trend
  const trend = calculateTrend(quizzes || [], mockExams || [], thirtyDaysAgo, sevenDaysAgo);

  // 7. Calculate Estimated Exam Day Score
  // Exam day pressure typically reduces performance slightly, but high confidence mitigates this
  const pressurePenalty = confidenceLevel === "High" ? 0.98 : confidenceLevel === "Medium" ? 0.95 : 0.90;
  const estimatedExamDayScore = Math.max(0, Math.min(Math.round(overallScore * pressurePenalty), 100));

  // 8. Calculate The Three Dimensions (F2.2.5)
  // Knowledge: Focuses on mastery, quizzes, and learning velocity
  const knowledgeScore = Math.round(
    ((subjectMasteryScore / 25) * 50) + 
    ((practiceQuizScore / 10) * 30) + 
    ((learningVelocityScore / 3) * 20)
  );

  // Memory: Focuses on retention and review completion
  const memoryScore = Math.round(
    ((memoryRetentionScore / 15) * 70) + 
    ((reviewCompletionScore / 5) * 30)
  );

  // Exam: Focuses on mock exams, consistency, and study time
  const examScore = Math.round(
    ((mockExamScore / 30) * 60) + 
    ((consistencyScore / 8) * 30) + 
    ((studyTimeScore / 2) * 10)
  );

  // 9. Calculate Readiness Potential Engine (F2.2.5)
  const { potential, opportunityAnalysis, recommendations } = calculateReadinessPotential(
    overallScore,
    userCards || [],
    subjectMasteries || [],
    mockExams || [],
    reviewHistory || [],
    now
  );

  return {
    overallScore,
    confidenceScore,
    confidenceLevel,
    estimatedExamDayScore,
    subjectReadiness,
    trend,
    isCalibrated: true,
    dimensions: {
      knowledge: Math.max(0, Math.min(knowledgeScore, 100)),
      memory: Math.max(0, Math.min(memoryScore, 100)),
      exam: Math.max(0, Math.min(examScore, 100)),
    },
    potential: {
      currentReadiness: overallScore,
      potentialReadiness: potential,
      potentialGain: potential - overallScore,
      recommendations,
      opportunityAnalysis,
    },
    breakdown: {
      mockExams: Number(mockExamScore.toFixed(2)),
      subjectMastery: Number(subjectMasteryScore.toFixed(2)),
      memoryRetention: Number(memoryRetentionScore.toFixed(2)),
      practiceQuizzes: Number(practiceQuizScore.toFixed(2)),
      consistency: Number(consistencyScore.toFixed(2)),
      reviewCompletion: Number(reviewCompletionScore.toFixed(2)),
      learningVelocity: Number(learningVelocityScore.toFixed(2)),
      studyTime: Number(studyTimeScore.toFixed(2)),
      confidence: Number(confidenceDimensionScore.toFixed(2))
    },
    rawMetrics: {
      mockExamsTaken,
      totalQuestionsAnswered,
      daysActive: profile?.created_at ? Math.max(1, Math.floor((now.getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))) : 1
    }
  };
}

// ============================================================================
// DIMENSION CALCULATORS
// ============================================================================

/**
 * Dimension 1: Mock Exam Performance (Max 30 points)
 * Factors: Average score, Time decay (recent exams matter more), Completion rate
 */
function calculateMockExamScore(mockExams: any[], now: Date): number {
  const MAX_POINTS = 30;
  if (!mockExams || mockExams.length === 0) return 0;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  mockExams.forEach((exam) => {
    const data = exam.score_data as any;
    if (!data || !data.totalQuestions || data.totalQuestions === 0) return;

    // Base percentage (0-1)
    const rawPercentage = data.totalScore / data.totalQuestions;
    
    // Time decay weight (Half-life of ~30 days)
    const examDate = new Date(exam.created_at);
    const daysAgo = Math.max(0, (now.getTime() - examDate.getTime()) / (1000 * 60 * 60 * 24));
    const timeWeight = Math.exp(-daysAgo / 45); // Slower decay for mock exams
    
    // Completion penalty (Penalize heavily if they didn't finish)
    // Assuming a standard CET has ~150-200 questions. If they only answered 10, it's not a real mock exam.
    const completionRate = Math.min(data.totalQuestions / 100, 1.0); 
    const completionWeight = completionRate < 0.5 ? completionRate * 0.5 : 1.0; // Severe penalty for < 50% completion

    const finalWeight = timeWeight * completionWeight;
    
    totalWeightedScore += rawPercentage * finalWeight;
    totalWeight += finalWeight;
  });

  if (totalWeight === 0) return 0;
  
  const weightedAverage = totalWeightedScore / totalWeight;
  return Math.min(weightedAverage * MAX_POINTS, MAX_POINTS);
}

/**
 * Dimension 2: Subject Mastery (Max 25 points)
 * Factors: Weighted average of subject masteries based on CET importance
 */
function calculateSubjectMasteryScore(subjectMasteries: any[]): { subjectMasteryScore: number, subjectReadiness: Record<string, number> } {
  const MAX_POINTS = 25;
  const subjectReadiness: Record<string, number> = {};
  
  if (!subjectMasteries || subjectMasteries.length === 0) {
    return { subjectMasteryScore: 0, subjectReadiness };
  }

  let totalWeightedMastery = 0;
  let totalWeights = 0;

  subjectMasteries.forEach(sub => {
    if (!sub.subject_id || sub.mastery_percentage === null) return;
    
    // Require minimum sample size per subject to count fully
    const sampleSizeConfidence = Math.min((sub.total_questions_attempted || 0) / 20, 1.0);
    const rawMastery = Math.max(0, Math.min(sub.mastery_percentage, 100)) / 100; // 0-1
    
    // Determine subject weight based on name or ID
    const subjectNameLower = (sub.subject_name || sub.subject_id).toLowerCase();
    let weight = SUBJECT_WEIGHTS["default"];
    
    for (const [key, val] of Object.entries(SUBJECT_WEIGHTS)) {
      if (subjectNameLower.includes(key)) {
        weight = val;
        break;
      }
    }

    // Apply sample size confidence to the weight
    const effectiveWeight = weight * (0.2 + (0.8 * sampleSizeConfidence));
    
    totalWeightedMastery += rawMastery * effectiveWeight;
    totalWeights += effectiveWeight;
    
    // Store for the breakdown map (0-100 scale)
    subjectReadiness[sub.subject_id] = Math.round(rawMastery * 100);
  });

  if (totalWeights === 0) return { subjectMasteryScore: 0, subjectReadiness };

  const weightedAverage = totalWeightedMastery / totalWeights;
  return { 
    subjectMasteryScore: Math.min(weightedAverage * MAX_POINTS, MAX_POINTS),
    subjectReadiness
  };
}

/**
 * Dimension 3: Memory Retention (Max 15 points)
 * Factors: Average retention score, Ease factor, Lapses, Review count
 */
function calculateMemoryRetentionScore(userCards: any[], now: Date): number {
  const MAX_POINTS = 15;
  if (!userCards || userCards.length === 0) return 0;

  let totalScore = 0;
  let validCards = 0;

  userCards.forEach(card => {
    // Only count cards that have been reviewed at least once
    if (card.state === 'learning' && (!card.reviews_count || card.reviews_count === 0)) return;

    // Base retention (0-1)
    let cardScore = Math.max(0, Math.min(card.retention_score || 0, 1.0));

    // Penalty for high lapses (struggling to remember)
    if (card.lapses_count && card.lapses_count > 3) {
      cardScore *= Math.max(0.5, 1 - (card.lapses_count * 0.05));
    }

    // Bonus for high ease factor (easy to remember)
    if (card.ease_factor && card.ease_factor > 2.5) {
      cardScore = Math.min(1.0, cardScore * 1.1);
    }

    // Penalty for severely overdue cards
    if (card.next_review) {
      const nextReview = new Date(card.next_review);
      if (nextReview < now) {
        const daysOverdue = (now.getTime() - nextReview.getTime()) / (1000 * 60 * 60 * 24);
        if (daysOverdue > 7) {
          cardScore *= Math.max(0.6, Math.exp(-daysOverdue / 30));
        }
      }
    }

    totalScore += cardScore;
    validCards++;
  });

  if (validCards === 0) return 0;

  const averageScore = totalScore / validCards;
  return Math.min(averageScore * MAX_POINTS, MAX_POINTS);
}

/**
 * Dimension 4: Practice Quiz Performance (Max 10 points)
 * Factors: Average score, Time decay, Sample size confidence
 */
function calculatePracticeQuizScore(quizzes: any[], now: Date): number {
  const MAX_POINTS = 10;
  if (!quizzes || quizzes.length === 0) return 0;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  quizzes.forEach(quiz => {
    if (!quiz.total || quiz.total === 0) return;

    const rawPercentage = Math.max(0, Math.min(quiz.score / quiz.total, 1.0));
    
    // Time decay (Half-life of ~14 days for practice quizzes - they decay faster than mock exams)
    const quizDate = new Date(quiz.created_at);
    const daysAgo = Math.max(0, (now.getTime() - quizDate.getTime()) / (1000 * 60 * 60 * 24));
    const timeWeight = Math.exp(-daysAgo / 20);
    
    // Sample size weight (A 20-question quiz matters more than a 2-question quiz)
    const sizeWeight = Math.min(quiz.total / 15, 1.0); // Caps at 15 questions

    const finalWeight = timeWeight * sizeWeight;
    
    totalWeightedScore += rawPercentage * finalWeight;
    totalWeight += finalWeight;
  });

  if (totalWeight === 0) return 0;

  const weightedAverage = totalWeightedScore / totalWeight;
  return Math.min(weightedAverage * MAX_POINTS, MAX_POINTS);
}

/**
 * Dimension 5: Consistency (Max 8 points)
 * Factors: Active days in last 30 days, Current streak
 */
function calculateConsistencyScore(reviewHistory: any[], currentStreak: number, now: Date): number {
  const MAX_POINTS = 8;
  
  // 1. Calculate active days in last 30 days (Max 5 points)
  const activeDays = new Set<string>();
  reviewHistory.forEach(r => {
    const dateStr = new Date(r.reviewed_at).toISOString().split('T')[0];
    activeDays.add(dateStr);
  });
  
  const activeDaysScore = Math.min(activeDays.size / 20, 1.0) * 5; // 20 active days in a month = max points
  
  // 2. Current Streak (Max 3 points)
  const streakScore = Math.min(currentStreak / 14, 1.0) * 3; // 14 day streak = max points

  return Math.min(activeDaysScore + streakScore, MAX_POINTS);
}

/**
 * Dimension 6: Review Completion (Max 5 points)
 * Factors: Queue discipline (ratio of due cards to total cards)
 */
function calculateReviewCompletionScore(userCards: any[], reviewHistory: any[], now: Date): number {
  const MAX_POINTS = 5;
  if (!userCards || userCards.length === 0) return 0;

  let dueCards = 0;
  let totalActiveCards = 0;

  userCards.forEach(card => {
    if (card.state === 'review' || card.state === 'relearning') {
      totalActiveCards++;
      if (card.next_review && new Date(card.next_review) <= now) {
        dueCards++;
      }
    }
  });

  if (totalActiveCards === 0) return 0;

  // If they have 0 due cards, they get 100% of the points.
  // If 50% of their active cards are due, they get 0 points (poor queue discipline).
  const dueRatio = dueCards / totalActiveCards;
  const disciplineScore = Math.max(0, 1 - (dueRatio * 2)); // * 2 makes the penalty steeper

  return Math.min(disciplineScore * MAX_POINTS, MAX_POINTS);
}

/**
 * Dimension 7: Learning Velocity (Max 3 points)
 * Factors: Improvement rate between older and newer quizzes
 */
function calculateLearningVelocityScore(quizzes: any[], reviewHistory: any[], thirtyDaysAgo: string, sevenDaysAgo: string): number {
  const MAX_POINTS = 3;
  
  // We need enough quizzes to measure velocity
  if (!quizzes || quizzes.length < 4) return 1.5; // Default middle score if not enough data

  // Split quizzes into "recent" (last 7 days) and "older" (8-30 days ago)
  const recentQuizzes = quizzes.filter(q => q.created_at >= sevenDaysAgo);
  const olderQuizzes = quizzes.filter(q => q.created_at >= thirtyDaysAgo && q.created_at < sevenDaysAgo);

  if (recentQuizzes.length === 0 || olderQuizzes.length === 0) return 1.5;

  const getAvgScore = (arr: any[]) => {
    let totalScore = 0;
    let totalQ = 0;
    arr.forEach(q => {
      if (q.total > 0) {
        totalScore += q.score;
        totalQ += q.total;
      }
    });
    return totalQ > 0 ? totalScore / totalQ : 0;
  };

  const recentAvg = getAvgScore(recentQuizzes);
  const olderAvg = getAvgScore(olderQuizzes);

  // Calculate improvement (-1.0 to 1.0)
  const improvement = recentAvg - olderAvg;
  
  // Map improvement to points
  // If improvement is > 10%, max points
  // If improvement is 0%, middle points
  // If improvement is < -10%, 0 points
  let velocityScore = 1.5; // Base
  if (improvement > 0) {
    velocityScore += Math.min(improvement / 0.10, 1.0) * 1.5;
  } else if (improvement < 0) {
    velocityScore -= Math.min(Math.abs(improvement) / 0.10, 1.0) * 1.5;
  }

  return Math.max(0, Math.min(velocityScore, MAX_POINTS));
}

/**
 * Dimension 8: Study Time (Max 2 points)
 * Factors: Productive study time in the last 30 days
 */
function calculateStudyTimeScore(reviewHistory: any[], quizzes: any[], mockExams: any[]): number {
  const MAX_POINTS = 2;
  let totalProductiveSeconds = 0;

  // Add review time (cap individual reviews at 60s to exclude idle time)
  reviewHistory?.forEach(r => {
    totalProductiveSeconds += Math.min(r.response_time_seconds || 0, 60);
  });

  // Estimate quiz time (no time_spent_seconds column available)
  // Assume average 2 minutes per question for estimation
  quizzes?.forEach(q => {
    const estimatedSeconds = (q.total || 0) * 120; // 2 min per question
    totalProductiveSeconds += Math.min(estimatedSeconds, 3600); // Cap at 1 hour per quiz
  });

  // Estimate mock exam time (no time_spent_seconds column available)
  // Assume average 1.5 minutes per question for full exams
  mockExams?.forEach(m => {
    const data = m.score_data as any;
    const estimatedSeconds = (data?.totalQuestions || 0) * 90; // 1.5 min per question
    totalProductiveSeconds += Math.min(estimatedSeconds, 10800); // Cap at 3 hours per exam
  });

  // Target: 20 hours (72,000 seconds) of productive study in a month = max points
  const timeScore = Math.min(totalProductiveSeconds / 72000, 1.0);

  return Math.min(timeScore * MAX_POINTS, MAX_POINTS);
}

// ============================================================================
// STATISTICAL CONFIDENCE & TREND
// ============================================================================

function calculateStatisticalConfidence(
  mockExamsTaken: number,
  totalQuestionsAnswered: number,
  totalReviews: number,
  totalCards: number,
  accountCreatedAt: string,
  now: Date
): { confidenceScore: number, confidenceLevel: ConfidenceLevel } {
  
  // Calculate individual confidence factors (0-100 scale)
  const mockExamConfidence = Math.min((mockExamsTaken / 3) * 100, 100); // 3 mock exams = 100% confidence for this metric
  const questionConfidence = Math.min((totalQuestionsAnswered / 300) * 100, 100); // 300 questions = 100%
  const reviewConfidence = Math.min((totalReviews / 1000) * 100, 100); // 1000 reviews = 100%
  const deckSizeConfidence = Math.min((totalCards / 500) * 100, 100); // 500 cards = 100%
  
  // Account age confidence (needs at least 14 days of history for high confidence)
  const daysActive = Math.max(1, (now.getTime() - new Date(accountCreatedAt).getTime()) / (1000 * 60 * 60 * 24));
  const timeConfidence = Math.min((daysActive / 14) * 100, 100);

  // Weighted average for overall confidence score
  const confidenceScore = Math.round(
    (mockExamConfidence * 0.40) +
    (questionConfidence * 0.25) +
    (reviewConfidence * 0.15) +
    (deckSizeConfidence * 0.10) +
    (timeConfidence * 0.10)
  );

  // Determine Level
  let confidenceLevel: ConfidenceLevel = "Low";
  if (confidenceScore >= 80) confidenceLevel = "High";
  else if (confidenceScore >= 40) confidenceLevel = "Medium";
  else if (confidenceScore < 15) confidenceLevel = "Insufficient Data";

  return { confidenceScore, confidenceLevel };
}

function calculateTrend(quizzes: any[], mockExams: any[], thirtyDaysAgo: string, sevenDaysAgo: string): ReadinessTrend {
  // Combine and sort all assessments
  const allAssessments = [
    ...quizzes.map(q => ({ date: q.created_at, score: q.total > 0 ? q.score / q.total : 0, weight: 1 })),
    ...mockExams.map(m => {
      const data = m.score_data as any;
      return { 
        date: m.created_at, 
        score: data?.totalQuestions > 0 ? data.totalScore / data.totalQuestions : 0, 
        weight: 3 // Mock exams carry more weight in trend analysis
      };
    })
  ].filter(a => a.score > 0); // Filter out 0s which might be abandoned attempts

  if (allAssessments.length < 5) return "unknown";

  // Split into recent and older
  const recent = allAssessments.filter(a => a.date >= sevenDaysAgo);
  const older = allAssessments.filter(a => a.date >= thirtyDaysAgo && a.date < sevenDaysAgo);

  if (recent.length === 0 || older.length === 0) return "stable";

  // Calculate weighted averages
  const getWeightedAvg = (arr: any[]) => {
    const totalScore = arr.reduce((sum, a) => sum + (a.score * a.weight), 0);
    const totalWeight = arr.reduce((sum, a) => sum + a.weight, 0);
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  };

  const recentAvg = getWeightedAvg(recent);
  const olderAvg = getWeightedAvg(older);

  const difference = recentAvg - olderAvg;

  // Thresholds for trend
  if (difference > 0.05) return "improving"; // > 5% improvement
  if (difference < -0.05) return "declining"; // > 5% decline
  return "stable";
}

// ============================================================================
// FALLBACKS
// ============================================================================

function generateUncalibratedMetrics(mockExamsTaken: number, totalQuestionsAnswered: number): ReadinessMetrics {
  return {
    overallScore: 0,
    confidenceScore: 0,
    confidenceLevel: "Insufficient Data",
    estimatedExamDayScore: 0,
    subjectReadiness: {},
    trend: "unknown",
    isCalibrated: false,
    dimensions: { knowledge: 0, memory: 0, exam: 0 },
    potential: {
      currentReadiness: 0,
      potentialReadiness: 0,
      potentialGain: 0,
      recommendations: [],
      opportunityAnalysis: {
        lostToOverdueReviews: 0, lostToWeakRetention: 0, lostToInconsistency: 0,
        lostToLowMockExposure: 0, lostToUnfinishedTopics: 0
      }
    },
    breakdown: {
      mockExams: 0, subjectMastery: 0, memoryRetention: 0, practiceQuizzes: 0,
      consistency: 0, reviewCompletion: 0, learningVelocity: 0, studyTime: 0, confidence: 0
    },
    rawMetrics: {
      mockExamsTaken,
      totalQuestionsAnswered,
      daysActive: 0
    }
  };
}

// ============================================================================
// READINESS POTENTIAL ENGINE (F2.2.5)
// ============================================================================

function calculateReadinessPotential(
  currentScore: number,
  userCards: any[],
  subjectMasteries: any[],
  mockExams: any[],
  reviewHistory: any[],
  now: Date
) {
  const recommendations: ReadinessRecommendation[] = [];
  const opportunityAnalysis = {
    lostToOverdueReviews: 0,
    lostToWeakRetention: 0,
    lostToInconsistency: 0,
    lostToLowMockExposure: 0,
    lostToUnfinishedTopics: 0,
  };

  let totalPotentialGain = 0;

  // 1. Overdue Reviews Opportunity
  let overdueCards = 0;
  userCards.forEach(card => {
    if (card.next_review && new Date(card.next_review) <= now) overdueCards++;
  });

  if (overdueCards > 0) {
    // Max 5% gain from clearing queue
    const impact = Math.min(Number((overdueCards * 0.05).toFixed(1)), 5.0);
    opportunityAnalysis.lostToOverdueReviews = impact;
    totalPotentialGain += impact;

    recommendations.push({
      id: "clear-queue",
      title: "Complete today's review queue",
      description: `You have ${overdueCards} cards waiting for review. Clearing them will immediately improve your memory retention score.`,
      impact,
      estimatedTimeMinutes: Math.ceil(overdueCards * 0.25), // ~15s per card
      difficulty: overdueCards > 50 ? "Medium" : "Low",
      actionUrl: "/review/session",
      actionLabel: "Start Review"
    });
  }

  // 2. Mock Exam Exposure Opportunity
  if (mockExams.length < 3) {
    // Max 8% gain from taking more mock exams
    const impact = Number(((3 - mockExams.length) * 2.6).toFixed(1));
    opportunityAnalysis.lostToLowMockExposure = impact;
    totalPotentialGain += impact;

    recommendations.push({
      id: "take-mock",
      title: "Take a full mock exam",
      description: "Mock exams have the highest impact on your readiness score. Taking one will significantly boost your exam confidence.",
      impact: 4.8, // Specific impact for taking ONE exam
      estimatedTimeMinutes: 120,
      difficulty: "High",
      actionUrl: "/exam",
      actionLabel: "Take Exam"
    });
  }

  // 3. Weak Subjects Opportunity
  const weakSubjects = subjectMasteries.filter(s => s.mastery_percentage !== null && s.mastery_percentage < 60);
  if (weakSubjects.length > 0) {
    // Sort by weakest first
    weakSubjects.sort((a, b) => a.mastery_percentage - b.mastery_percentage);
    const weakest = weakSubjects[0];
    
    const impact = Number(((60 - weakest.mastery_percentage) * 0.1).toFixed(1));
    opportunityAnalysis.lostToUnfinishedTopics = impact;
    totalPotentialGain += impact;

    recommendations.push({
      id: `improve-${weakest.subject_id}`,
      title: `Improve ${weakest.subject_name || 'weakest subject'} mastery`,
      description: `Your mastery in this subject is holding you back. Focus on practice quizzes to raise it above 60%.`,
      impact,
      estimatedTimeMinutes: 45,
      difficulty: "Medium",
      actionUrl: `/subjects/${weakest.subject_id}`,
      actionLabel: "Study Subject"
    });
  }

  // 4. Inconsistency Opportunity
  const activeDays = new Set<string>();
  reviewHistory.forEach(r => {
    const dateStr = new Date(r.reviewed_at).toISOString().split('T')[0];
    activeDays.add(dateStr);
  });
  
  if (activeDays.size < 10) { // Less than 10 active days in last 30
    const impact = 3.2;
    opportunityAnalysis.lostToInconsistency = impact;
    totalPotentialGain += impact;

    recommendations.push({
      id: "build-streak",
      title: "Study for 3 consecutive days",
      description: "Consistency is key. Studying a little bit every day builds a stronger foundation than marathon sessions.",
      impact,
      estimatedTimeMinutes: 15,
      difficulty: "Low",
      actionUrl: "/practice",
      actionLabel: "Practice Now"
    });
  }

  // Sort recommendations by highest impact
  recommendations.sort((a, b) => b.impact - a.impact);

  // Cap potential readiness at 100%
  const potentialReadiness = Math.min(Math.round(currentScore + totalPotentialGain), 100);

  return {
    potential: potentialReadiness,
    opportunityAnalysis,
    recommendations
  };
}
