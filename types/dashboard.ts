/**
 * Dashboard Data Types
 * Centralized type definitions for all dashboard data
 * 
 * This is the single source of truth for dashboard data structure.
 * Every dashboard widget must consume data conforming to these types.
 */

// =============================================================================
// USER PROFILE
// =============================================================================

export interface DashboardUser {
  id: string;
  email: string;
  streak: number;
  dailyReviewLimit: number;
  level?: number; // Prepared for F2.4
  xp?: number; // Prepared for F2.4
  settings: Record<string, unknown>;
}

// =============================================================================
// STUDY QUEUE
// =============================================================================

export interface StudyQueue {
  dueCards: number;
  newCards: number;
  completedToday: number;
  estimatedTimeMinutes: number;
  reviewsCompletedToday: number;
}

// =============================================================================
// MEMORY STATISTICS
// =============================================================================

export interface MemoryStatistics {
  totalCards: number;
  masteredCards: number;
  learningCards: number;
  reviewCards: number;
  relearnCards: number;
  averageRetention: number;
  retentionDistribution: {
    excellent: number; // 90-100%
    good: number; // 70-89%
    fair: number; // 50-69%
    poor: number; // 0-49%
  };
}

// =============================================================================
// CET READINESS
// =============================================================================

export interface CETReadiness {
  overallScore: number;
  confidenceScore: number;
  confidenceLevel: 'High' | 'Medium' | 'Low' | 'Insufficient Data';
  isCalibrated: boolean;
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
  estimatedExamDayScore: number;
  mockExamsTaken: number;
  lastMockExamScore?: number;
  lastMockExamDate?: string;
  weakSubjects: string[];
  strongSubjects: string[];
  breakdown?: {
    mockExams: number;
    subjectMastery: number;
    memoryRetention: number;
    practiceQuizzes: number;
    consistency: number;
    reviewCompletion: number;
    learningVelocity: number;
    studyTime: number;
    confidence: number;
  };
}

// =============================================================================
// LEARNING PROGRESS
// =============================================================================

export interface LearningProgress {
  topicsStarted: number;
  topicsMastered: number;
  totalTopics: number;
  studyTimeSeconds: number;
  studyTimeFormatted: string;
  cardsMastered: number;
  mockExamsCompleted: number;
  quizzesCompleted: number;
  averageAccuracy: number;
}

// =============================================================================
// ACTIVITY FEED
// =============================================================================

export type ActivityType = 'quiz' | 'exam' | 'review' | 'study' | 'achievement';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface ActivityFeed {
  events: ActivityEvent[];
  totalEvents: number;
  lastActivityDate?: string;
}

// =============================================================================
// STUDY HEATMAP
// =============================================================================

export interface HeatmapDataPoint {
  date: string; // ISO date string (YYYY-MM-DD)
  count: number;
  studyTimeSeconds: number;
}

export interface StudyHeatmap {
  data: HeatmapDataPoint[];
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
}

// =============================================================================
// STUDY INSIGHTS
// =============================================================================

export type InsightPriority = 'critical' | 'high' | 'medium' | 'low';
export type InsightType = 
  | 'weak_topic'
  | 'due_reviews'
  | 'streak_risk'
  | 'performance_drop'
  | 'milestone'
  | 'recommendation';

export interface StudyInsight {
  id: string;
  type: InsightType;
  priority: InsightPriority;
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface StudyInsights {
  insights: StudyInsight[];
  criticalCount: number;
  highPriorityCount: number;
}

// =============================================================================
// AI COACH
// =============================================================================

export interface AICoach {
  dailyBrief: string;
  lastUpdated: string;
  isLoading: boolean;
}

// =============================================================================
// QUICK ACTIONS
// =============================================================================

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
  priority: number;
}

// =============================================================================
// GAMIFICATION (Prepared for F2.8)
// =============================================================================

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  progress: number;
  maxProgress: number;
}

export interface Gamification {
  recentAchievements: Achievement[];
  totalAchievements: number;
  unlockedAchievements: number;
  nextMilestone?: {
    title: string;
    progress: number;
    maxProgress: number;
  };
}

// =============================================================================
// DASHBOARD METADATA
// =============================================================================

export interface DashboardMetadata {
  lastUpdated: string;
  cacheStatus: {
    isStale: boolean;
    lastRefresh: string;
    nextRefresh?: string;
  };
  loadingState: {
    isLoading: boolean;
    loadedSections: string[];
    failedSections: string[];
  };
  version: string;
}

// =============================================================================
// MAIN DASHBOARD DATA
// =============================================================================

export interface DashboardData {
  // Core Data
  user: DashboardUser;
  studyQueue: StudyQueue;
  memoryStatistics: MemoryStatistics;
  cetReadiness: CETReadiness;
  learningProgress: LearningProgress;
  
  // Activity & Insights
  activityFeed: ActivityFeed;
  studyHeatmap: StudyHeatmap;
  studyInsights: StudyInsights;
  aiCoach: AICoach;
  
  // Gamification (Future)
  gamification?: Gamification;
  
  // Quick Actions
  quickActions: QuickAction[];
  
  // Metadata
  metadata: DashboardMetadata;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface DashboardError {
  section: string;
  error: string;
  timestamp: string;
  canRetry: boolean;
}

export interface DashboardDataResult {
  data?: DashboardData;
  errors?: DashboardError[];
  partial: boolean; // True if some sections failed but others succeeded
}