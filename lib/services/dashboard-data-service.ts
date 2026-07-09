/**
 * Dashboard Data Service
 * Centralized service for fetching and aggregating all dashboard data
 * 
 * This is the ONLY place where dashboard data should be fetched.
 * The dashboard page should consume data from this service exclusively.
 * 
 * Architecture:
 * Dashboard Page → DashboardDataService → Server Actions → Supabase → Database
 */

import { createClient } from "@/lib/supabase/server";
import { calculateReadiness } from "@/lib/intelligence/readiness";
import { generateStudyInsights } from "@/lib/intelligence/insights";
import { generateDailyBrief } from "@/app/actions/ai";
import type {
  DashboardData,
  DashboardDataResult,
  DashboardError,
  DashboardUser,
  StudyQueue,
  MemoryStatistics,
  CETReadiness,
  LearningProgress,
  ActivityFeed,
  ActivityEvent,
  StudyHeatmap,
  HeatmapDataPoint,
  StudyInsights,
  AICoach,
  QuickAction,
} from "@/types/dashboard";

// =============================================================================
// CONFIGURATION
// =============================================================================

const DASHBOARD_VERSION = "2.0.0";
const AVG_TIME_PER_CARD_SECONDS = 15;
const HEATMAP_DAYS = 365;
const RECENT_ACTIVITY_LIMIT = 20;

// =============================================================================
// MAIN SERVICE
// =============================================================================

export async function getDashboardData(userId: string): Promise<DashboardDataResult> {
  const errors: DashboardError[] = [];
  const loadedSections: string[] = [];
  const failedSections: string[] = [];

  try {
    const supabase = await createClient();
    
    // Calculate date ranges once
    const now = new Date();
    const nowStr = now.toISOString();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - HEATMAP_DAYS);
    const oneYearAgoStr = oneYearAgo.toISOString();

    // Fetch all data in parallel for performance
    const [
      userResult,
      studyQueueResult,
      memoryStatsResult,
      readinessResult,
      learningProgressResult,
      activityResult,
      heatmapResult,
      insightsResult,
      aiCoachResult,
    ] = await Promise.allSettled([
      fetchUserData(supabase, userId),
      fetchStudyQueue(supabase, userId, nowStr, startOfDay),
      fetchMemoryStatistics(supabase, userId),
      fetchCETReadiness(userId),
      fetchLearningProgress(supabase, userId),
      fetchActivityFeed(supabase, userId),
      fetchStudyHeatmap(supabase, userId, oneYearAgoStr),
      fetchStudyInsights(userId),
      fetchAICoach(),
    ]);

    // Process results and collect errors
    const user = processResult(userResult, "user", errors, loadedSections, failedSections);
    const studyQueue = processResult(studyQueueResult, "studyQueue", errors, loadedSections, failedSections);
    const memoryStatistics = processResult(memoryStatsResult, "memoryStatistics", errors, loadedSections, failedSections);
    const cetReadiness = processResult(readinessResult, "cetReadiness", errors, loadedSections, failedSections);
    const learningProgress = processResult(learningProgressResult, "learningProgress", errors, loadedSections, failedSections);
    const activityFeed = processResult(activityResult, "activityFeed", errors, loadedSections, failedSections);
    const studyHeatmap = processResult(heatmapResult, "studyHeatmap", errors, loadedSections, failedSections);
    const studyInsights = processResult(insightsResult, "studyInsights", errors, loadedSections, failedSections);
    const aiCoach = processResult(aiCoachResult, "aiCoach", errors, loadedSections, failedSections);

    // Generate quick actions based on available data
    const quickActions = generateQuickActions(studyQueue, cetReadiness);

    // Build dashboard data object
    const dashboardData: DashboardData = {
      user: user || getDefaultUser(userId),
      studyQueue: studyQueue || getDefaultStudyQueue(),
      memoryStatistics: memoryStatistics || getDefaultMemoryStatistics(),
      cetReadiness: cetReadiness || getDefaultCETReadiness(),
      learningProgress: learningProgress || getDefaultLearningProgress(),
      activityFeed: activityFeed || getDefaultActivityFeed(),
      studyHeatmap: studyHeatmap || getDefaultStudyHeatmap(),
      studyInsights: studyInsights || getDefaultStudyInsights(),
      aiCoach: aiCoach || getDefaultAICoach(),
      quickActions,
      metadata: {
        lastUpdated: new Date().toISOString(),
        cacheStatus: {
          isStale: false,
          lastRefresh: new Date().toISOString(),
        },
        loadingState: {
          isLoading: false,
          loadedSections,
          failedSections,
        },
        version: DASHBOARD_VERSION,
      },
    };

    return {
      data: dashboardData,
      errors: errors.length > 0 ? errors : undefined,
      partial: failedSections.length > 0,
    };
  } catch (error) {
    // Critical error - entire dashboard failed
    const criticalError: DashboardError = {
      section: "dashboard",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      canRetry: true,
    };

    return {
      errors: [criticalError],
      partial: false,
    };
  }
}

// =============================================================================
// DATA FETCHING FUNCTIONS
// =============================================================================

async function fetchUserData(supabase: any, userId: string): Promise<DashboardUser> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("streak, daily_review_limit, settings")
    .eq("id", userId)
    .single();

  if (error) throw new Error(`Failed to fetch user profile: ${error.message}`);

  const { data: { user } } = await supabase.auth.getUser();

  return {
    id: userId,
    email: user?.email || "",
    streak: profile?.streak || 0,
    dailyReviewLimit: profile?.daily_review_limit || 50,
    settings: profile?.settings || {},
  };
}

async function fetchStudyQueue(
  supabase: any,
  userId: string,
  nowStr: string,
  startOfDay: string
): Promise<StudyQueue> {
  const [
    { count: dueCount },
    { count: newCardsCount },
    { count: completedToday },
  ] = await Promise.all([
    supabase
      .from("user_cards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("state", ["relearning", "review"])
      .lte("next_review", nowStr),
    supabase
      .from("user_cards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("state", "learning"),
    supabase
      .from("review_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("reviewed_at", startOfDay),
  ]);

  const dueCards = dueCount || 0;
  const newCards = newCardsCount || 0;
  const estimatedTimeMinutes = Math.ceil(
    ((dueCards + newCards) * AVG_TIME_PER_CARD_SECONDS) / 60
  );

  return {
    dueCards,
    newCards,
    completedToday: completedToday || 0,
    estimatedTimeMinutes,
    reviewsCompletedToday: completedToday || 0,
  };
}

async function fetchMemoryStatistics(
  supabase: any,
  userId: string
): Promise<MemoryStatistics> {
  const { data: cards, error } = await supabase
    .from("user_cards")
    .select("state, retention_score")
    .eq("user_id", userId);

  if (error) throw new Error(`Failed to fetch memory statistics: ${error.message}`);

  if (!cards || cards.length === 0) {
    return {
      totalCards: 0,
      masteredCards: 0,
      learningCards: 0,
      reviewCards: 0,
      relearnCards: 0,
      averageRetention: 0,
      retentionDistribution: {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
      },
    };
  }

  let masteredCards = 0;
  let learningCards = 0;
  let reviewCards = 0;
  let relearnCards = 0;
  let totalRetention = 0;
  let excellent = 0;
  let good = 0;
  let fair = 0;
  let poor = 0;

  cards.forEach((card: any) => {
    const retention = card.retention_score * 100;
    totalRetention += card.retention_score;

    if (card.state === "review") masteredCards++;
    else if (card.state === "learning") learningCards++;
    else if (card.state === "relearning") relearnCards++;
    
    reviewCards = cards.filter((c: any) => c.state === "review").length;

    if (retention >= 90) excellent++;
    else if (retention >= 70) good++;
    else if (retention >= 50) fair++;
    else poor++;
  });

  return {
    totalCards: cards.length,
    masteredCards,
    learningCards,
    reviewCards,
    relearnCards,
    averageRetention: Math.round((totalRetention / cards.length) * 100),
    retentionDistribution: {
      excellent,
      good,
      fair,
      poor,
    },
  };
}

async function fetchCETReadiness(userId: string): Promise<CETReadiness> {
  const metrics = await calculateReadiness(userId);

  return {
    overallScore: metrics.overallScore,
    confidenceScore: metrics.confidenceScore,
    confidenceLevel: metrics.confidenceLevel,
    isCalibrated: metrics.isCalibrated,
    trend: metrics.trend,
    estimatedExamDayScore: metrics.estimatedExamDayScore,
    mockExamsTaken: metrics.rawMetrics.mockExamsTaken,
    weakSubjects: [], // Will be calculated in F2.2.5 (Readiness Insights)
    strongSubjects: [], // Will be calculated in F2.2.5 (Readiness Insights)
    breakdown: metrics.breakdown,
    rawMetrics: metrics.rawMetrics,
  };
}

async function fetchLearningProgress(
  supabase: any,
  userId: string
): Promise<LearningProgress> {
  const [
    { data: topicMasteries },
    { data: cards },
    { data: quizAttempts },
    { data: mockExams },
  ] = await Promise.all([
    supabase
      .from("topic_mastery_view")
      .select("mastery_percentage")
      .eq("user_id", userId),
    supabase
      .from("user_cards")
      .select("state")
      .eq("user_id", userId)
      .eq("state", "review"),
    supabase
      .from("quiz_attempts")
      .select("id")
      .eq("user_id", userId),
    supabase
      .from("mock_exam_attempts")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "completed"),
  ]);

  let topicsStarted = 0;
  let topicsMastered = 0;

  if (topicMasteries) {
    topicMasteries.forEach((t: any) => {
      if (t.mastery_percentage !== null) {
        if (t.mastery_percentage > 0) topicsStarted++;
        if (t.mastery_percentage >= 80) topicsMastered++;
      }
    });
  }

  const cardsMastered = cards?.length || 0;
  const studyTimeSeconds = 0; // Will be calculated from review_history if needed

  return {
    topicsStarted,
    topicsMastered,
    totalTopics: topicMasteries?.length || 0,
    studyTimeSeconds,
    studyTimeFormatted: formatStudyTime(studyTimeSeconds),
    cardsMastered,
    mockExamsCompleted: mockExams?.length || 0,
    quizzesCompleted: quizAttempts?.length || 0,
    averageAccuracy: 0, // Will be calculated if needed
  };
}

async function fetchActivityFeed(
  supabase: any,
  userId: string
): Promise<ActivityFeed> {
  const [
    { data: quizAttempts },
    { data: mockExams },
    { data: recentReviews },
  ] = await Promise.all([
    supabase
      .from("quiz_attempts")
      .select("id, score, total, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(RECENT_ACTIVITY_LIMIT),
    supabase
      .from("mock_exam_attempts")
      .select("id, score_data, created_at")
      .eq("status", "completed")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(RECENT_ACTIVITY_LIMIT),
    supabase
      .from("review_history")
      .select("id, reviewed_at, rating")
      .eq("user_id", userId)
      .order("reviewed_at", { ascending: false })
      .limit(5),
  ]);

  const events: ActivityEvent[] = [];

  // Add quiz attempts
  quizAttempts?.forEach((a: any) => {
    const scorePct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
    events.push({
      id: `quiz-${a.id}`,
      type: "quiz",
      title: "Practice Quiz",
      description: `${a.score} / ${a.total} correct`,
      timestamp: a.created_at,
      score: scorePct,
    });
  });

  // Add mock exams
  mockExams?.forEach((a: any) => {
    const scorePct =
      a.score_data?.totalQuestions > 0
        ? Math.round((a.score_data.totalScore / a.score_data.totalQuestions) * 100)
        : 0;
    events.push({
      id: `exam-${a.id}`,
      type: "exam",
      title: "Mock Exam",
      description: `${a.score_data?.totalScore || 0} / ${a.score_data?.totalQuestions || 0} correct`,
      timestamp: a.created_at,
      score: scorePct,
    });
  });

  // Add recent reviews
  recentReviews?.forEach((r: any) => {
    events.push({
      id: `rev-${r.id}`,
      type: "review",
      title: "Flashcard Review",
      description:
        r.rating === "good" || r.rating === "easy"
          ? "Recalled successfully"
          : "Forgot card",
      timestamp: r.reviewed_at,
    });
  });

  events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return {
    events,
    totalEvents: events.length,
    lastActivityDate: events[0]?.timestamp,
  };
}

async function fetchStudyHeatmap(
  supabase: any,
  userId: string,
  startDate: string
): Promise<StudyHeatmap> {
  const { data: reviewHistory, error } = await supabase
    .from("review_history")
    .select("reviewed_at, response_time_seconds")
    .eq("user_id", userId)
    .gte("reviewed_at", startDate);

  if (error) throw new Error(`Failed to fetch heatmap data: ${error.message}`);

  const heatmapMap = new Map<string, { count: number; timeSeconds: number }>();

  reviewHistory?.forEach((r: any) => {
    const date = new Date(r.reviewed_at).toISOString().split("T")[0];
    const existing = heatmapMap.get(date) || { count: 0, timeSeconds: 0 };
    heatmapMap.set(date, {
      count: existing.count + 1,
      timeSeconds: existing.timeSeconds + (r.response_time_seconds || 0),
    });
  });

  const data: HeatmapDataPoint[] = Array.from(heatmapMap.entries()).map(
    ([date, stats]) => ({
      date,
      count: stats.count,
      studyTimeSeconds: stats.timeSeconds,
    })
  );

  // Calculate streaks
  const sortedDates = data.map((d) => d.date).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Streak calculation logic (simplified)
  sortedDates.forEach((date, index) => {
    if (index === 0 || isConsecutiveDay(sortedDates[index - 1], date)) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  });
  longestStreak = Math.max(longestStreak, tempStreak);
  currentStreak = tempStreak;

  return {
    data,
    currentStreak,
    longestStreak,
    totalDaysActive: sortedDates.length,
  };
}

async function fetchStudyInsights(userId: string): Promise<StudyInsights> {
  const readiness = await calculateReadiness(userId);
  const rawInsights = await generateStudyInsights(userId, readiness);

  // Map insights to our dashboard type
  const insights = rawInsights.map((i: any) => ({
    id: i.id || `insight-${Date.now()}`,
    type: i.type || 'recommendation',
    priority: i.priority || 'medium',
    title: i.title || i.message || 'Study Recommendation',
    description: i.description || i.message || '',
    actionLabel: i.actionLabel,
    actionUrl: i.actionUrl,
    metadata: i.metadata,
  }));

  const criticalCount = insights.filter((i) => i.priority === "critical").length;
  const highPriorityCount = insights.filter((i) => i.priority === "high").length;

  return {
    insights,
    criticalCount,
    highPriorityCount,
  };
}

async function fetchAICoach(): Promise<AICoach> {
  const dailyBrief = await generateDailyBrief();

  return {
    dailyBrief,
    lastUpdated: new Date().toISOString(),
    isLoading: false,
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function processResult<T>(
  result: PromiseSettledResult<T>,
  section: string,
  errors: DashboardError[],
  loaded: string[],
  failed: string[]
): T | undefined {
  if (result.status === "fulfilled") {
    loaded.push(section);
    return result.value;
  } else {
    failed.push(section);
    errors.push({
      section,
      error: result.reason?.message || "Unknown error",
      timestamp: new Date().toISOString(),
      canRetry: true,
    });
    return undefined;
  }
}

function generateQuickActions(
  studyQueue?: StudyQueue,
  readiness?: CETReadiness
): QuickAction[] {
  const actions: QuickAction[] = [
    {
      id: "review",
      label: "Review Cards",
      icon: "brain",
      href: "/review/session",
      badge: studyQueue?.dueCards,
      priority: 1,
    },
    {
      id: "practice",
      label: "Practice Quiz",
      icon: "book",
      href: "/practice",
      priority: 2,
    },
    {
      id: "mock-exam",
      label: "Mock Exam",
      icon: "clipboard",
      href: "/exam",
      priority: 3,
    },
    {
      id: "subjects",
      label: "Browse Subjects",
      icon: "folder",
      href: "/subjects",
      priority: 4,
    },
  ];

  return actions;
}

function formatStudyTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function isConsecutiveDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

// =============================================================================
// DEFAULT VALUES (Fallbacks for failed sections)
// =============================================================================

function getDefaultUser(userId: string): DashboardUser {
  return {
    id: userId,
    email: "",
    streak: 0,
    dailyReviewLimit: 50,
    settings: {},
  };
}

function getDefaultStudyQueue(): StudyQueue {
  return {
    dueCards: 0,
    newCards: 0,
    completedToday: 0,
    estimatedTimeMinutes: 0,
    reviewsCompletedToday: 0,
  };
}

function getDefaultMemoryStatistics(): MemoryStatistics {
  return {
    totalCards: 0,
    masteredCards: 0,
    learningCards: 0,
    reviewCards: 0,
    relearnCards: 0,
    averageRetention: 0,
    retentionDistribution: {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
    },
  };
}

function getDefaultCETReadiness(): CETReadiness {
  return {
    overallScore: 0,
    confidenceScore: 0,
    confidenceLevel: "Insufficient Data",
    isCalibrated: false,
    trend: "unknown",
    estimatedExamDayScore: 0,
    mockExamsTaken: 0,
    weakSubjects: [],
    strongSubjects: [],
    rawMetrics: {
      mockExamsTaken: 0,
      totalQuestionsAnswered: 0,
      daysActive: 0,
    },
  };
}

function getDefaultLearningProgress(): LearningProgress {
  return {
    topicsStarted: 0,
    topicsMastered: 0,
    totalTopics: 0,
    studyTimeSeconds: 0,
    studyTimeFormatted: "0m",
    cardsMastered: 0,
    mockExamsCompleted: 0,
    quizzesCompleted: 0,
    averageAccuracy: 0,
  };
}

function getDefaultActivityFeed(): ActivityFeed {
  return {
    events: [],
    totalEvents: 0,
  };
}

function getDefaultStudyHeatmap(): StudyHeatmap {
  return {
    data: [],
    currentStreak: 0,
    longestStreak: 0,
    totalDaysActive: 0,
  };
}

function getDefaultStudyInsights(): StudyInsights {
  return {
    insights: [],
    criticalCount: 0,
    highPriorityCount: 0,
  };
}

function getDefaultAICoach(): AICoach {
  return {
    dailyBrief: "Welcome to your CET preparation journey!",
    lastUpdated: new Date().toISOString(),
    isLoading: false,
  };
}