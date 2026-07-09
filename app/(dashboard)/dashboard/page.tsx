import { createClient } from "@/lib/supabase/server";
import { AccuracyRing } from "@/components/domain/AccuracyRing";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, CalendarDays } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReviewHeatmap } from "@/components/domain/ReviewHeatmap";
import { StudyInsightsList } from "@/components/domain/StudyInsightsList";
import { StudyPlan } from "@/components/domain/StudyPlan";
import { LearningJourney } from "@/components/domain/LearningJourney";
import { RecentActivity, ActivityEvent } from "@/components/domain/RecentActivity";
import { getUser } from "@/lib/auth";
import { updateUserStreak } from "@/lib/streak";
import { getDashboardData } from "@/lib/services/dashboard-data-service";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardGrid, DashboardSection } from "@/components/dashboard/DashboardGrid";
import { AICoachCard } from "@/components/dashboard/AICoachCard";
import { NoMockExamsEmpty, NoCardsEmpty } from "@/components/dashboard/DashboardEmpty";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Update streak if needed silently
  await updateUserStreak(user.id);

  // Use centralized DashboardDataService (F2.1.5)
  const { data: dashboardData, errors, partial } = await getDashboardData(user.id);

  // Handle critical failures
  if (!dashboardData) {
    throw new Error("Failed to load dashboard data");
  }

  // Destructure dashboard data
  const {
    user: dashboardUser,
    studyQueue,
    memoryStatistics,
    cetReadiness: readinessData,
    learningProgress,
    activityFeed,
    studyHeatmap,
    studyInsights,
    aiCoach,
    quickActions,
  } = dashboardData;

  // Map to legacy variable names for existing components
  const streak = dashboardUser.streak;
  const dailyLimit = dashboardUser.dailyReviewLimit;
  const cardsDueToday = studyQueue.dueCards;
  const newCards = studyQueue.newCards;
  const completedToday = studyQueue.completedToday;
  
  const masteredCards = memoryStatistics.masteredCards;
  const avgRetention = memoryStatistics.averageRetention;
  const allCards = Array(memoryStatistics.totalCards).fill({}); // Placeholder for card count
  
  const topicsStarted = learningProgress.topicsStarted;
  const topicsMastered = learningProgress.topicsMastered;
  const totalStudyTimeSeconds = learningProgress.studyTimeSeconds;
  
  const heatmapArray = studyHeatmap.data.map(d => ({ date: d.date, count: d.count }));
  const mockExamCount = readinessData.rawMetrics?.mockExamsTaken || 0;
  
  const cetReadiness = readinessData.overallScore;
  const readinessMetrics = readinessData; // Full metrics object
  const insights = studyInsights.insights.map(i => ({
    ...i,
    message: i.description, // Map description to message for compatibility
  })) as any; // Type assertion for compatibility with StudyInsightsList
  const aiBrief = aiCoach.dailyBrief;

  // Filter activity events to only compatible types for RecentActivity component
  const recentEvents = activityFeed.events.filter(
    (e) => e.type === 'quiz' || e.type === 'exam' || e.type === 'review'
  ) as ActivityEvent[]; // Type assertion after filtering incompatible types

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-[1400px] mx-auto pb-12 px-4 md:px-6">
      {/* Header */}
      <DashboardHeader streak={streak} />

      {/* AI Coach */}
      <AICoachCard message={aiBrief} />

      {/* Core Metrics Grid */}
      <DashboardGrid columns={3}>
        {/* CET Readiness */}
        <DashboardCard
          title="CET Readiness"
          description={
            readinessMetrics.confidenceScore < 30 
              ? "Need more data" 
              : readinessMetrics.trend === "improving" 
                ? "Trending Upward" 
                : "Based on AI Model"
          }
          accent="primary"
          isEmpty={mockExamCount === 0}
          emptyState={<NoMockExamsEmpty />}
        >
          <div className="flex flex-col items-center justify-center py-6 gap-4">
            <AccuracyRing accuracy={cetReadiness} size={140} label="Readiness" />
            <div className="flex flex-col items-center gap-1 text-sm text-[var(--muted)]">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[var(--color-secondary)]" />
                <span>{mockExamCount} Exams Taken</span>
              </div>
              {readinessMetrics.estimatedExamDayScore > 0 && (
                <span className="text-xs">
                  Est. Exam Day Score: <strong className="text-[var(--foreground)]">{readinessMetrics.estimatedExamDayScore}%</strong>
                </span>
              )}
            </div>
          </div>
        </DashboardCard>

        {/* Memory Health */}
        <DashboardCard
          title="Memory Health"
          description="Based on SM-2 Spaced Repetition"
          accent="secondary"
          isEmpty={!allCards || allCards.length === 0}
          emptyState={<NoCardsEmpty />}
        >
          <div className="flex flex-col items-center justify-center py-6 gap-4">
            {allCards && allCards.length > 0 ? (
              <>
                <AccuracyRing accuracy={avgRetention} size={140} label="Retention" />
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <TrendingUp className="h-4 w-4 text-[var(--color-success)]" />
                  <span>{masteredCards} Mastered Cards</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-2 h-[140px]">
                <span className="text-2xl font-bold text-[var(--muted)]">0%</span>
                <span className="text-sm text-[var(--muted)]">Not Enough Data Yet</span>
              </div>
            )}
          </div>
        </DashboardCard>

        {/* Today's Study Plan */}
        <div>
          <StudyPlan 
            dueReviews={cardsDueToday}
            newCards={newCards}
            completedReviews={completedToday}
            dailyReviewLimit={dailyLimit}
            avgTimePerCardSecs={15}
          />
        </div>
      </DashboardGrid>

      {/* Study Insights */}
      <DashboardSection>
        <StudyInsightsList insights={insights} />
      </DashboardSection>

      {/* Learning Progress */}
      <DashboardGrid columns={2}>
        <LearningJourney 
          topicsStarted={topicsStarted}
          topicsMastered={topicsMastered}
          totalTopics={learningProgress.totalTopics}
          studyTimeSeconds={totalStudyTimeSeconds}
          cardsMastered={masteredCards}
          mockExamsCompleted={mockExamCount}
        />
        
        <RecentActivity events={recentEvents} />
      </DashboardGrid>

      {/* Study Activity Heatmap */}
      <DashboardSection
        title="Study Activity Heatmap"
        icon={<CalendarDays className="w-6 h-6" />}
      >
        <Card className="shadow-sm border-[var(--border)]">
          <CardContent className="p-4 md:p-6">
            <ReviewHeatmap data={heatmapArray} days={365} />
          </CardContent>
        </Card>
      </DashboardSection>
    </div>
  );
}