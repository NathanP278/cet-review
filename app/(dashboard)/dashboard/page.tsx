import { createClient } from "@/lib/supabase/server";
import { AccuracyRing } from "@/components/domain/AccuracyRing";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, CalendarDays } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReviewHeatmap } from "@/components/domain/ReviewHeatmap";
import { StudyInsightsList } from "@/components/domain/StudyInsightsList";
import { calculateReadiness } from "@/lib/intelligence/readiness";
import { generateStudyInsights } from "@/lib/intelligence/insights";
import { StudyPlan } from "@/components/domain/StudyPlan";
import { LearningJourney } from "@/components/domain/LearningJourney";
import { RecentActivity, ActivityEvent } from "@/components/domain/RecentActivity";
import { getUser } from "@/lib/auth";
import { updateUserStreak } from "@/lib/streak";
import { generateDailyBrief } from "@/app/actions/ai";
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

  const nowStr = new Date().toISOString();
  const startOfDay = new Date(new Date().setHours(0,0,0,0)).toISOString();
  
  // For heatmap, 365 days
  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);
  const oneYearAgoStr = oneYearAgo.toISOString();

  // Run all independent queries in parallel to avoid massive rendering waterfalls
  const [
    { data: attemptsData },
    { data: mockExamsData },
    { count: reviewsCompletedToday },
    { data: allCards },
    { data: profile },
    { data: topicMasteries },
    { data: reviewHistoryData },
    { count: dueCount },
    { count: newCardsCount },
    readinessMetrics,
    aiBrief
  ] = await Promise.all([
    supabase.from("quiz_attempts").select("id, score, total, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("mock_exam_attempts").select("id, score_data, created_at").eq("status", "completed").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("review_history").select("*", { count: "exact", head: true }).eq("user_id", user.id).gte("reviewed_at", startOfDay),
    supabase.from("user_cards").select("state, retention_score").eq("user_id", user.id),
    supabase.from("profiles").select("streak, daily_review_limit, settings").eq("id", user.id).single(),
    supabase.from("topic_mastery_view").select("mastery_percentage").eq("user_id", user.id),
    supabase.from("review_history").select("id, reviewed_at, response_time_seconds, rating").eq("user_id", user.id).gte("reviewed_at", oneYearAgoStr),
    supabase.from("user_cards").select("*", { count: "exact", head: true }).eq("user_id", user.id).in("state", ["relearning", "review"]).lte("next_review", nowStr),
    supabase.from("user_cards").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("state", "learning"),
    calculateReadiness(user.id),
    generateDailyBrief()
  ]);

  const attempts = attemptsData || [];
  const mockExams = mockExamsData || [];
  const reviewHistory = reviewHistoryData || [];

  let masteredCards = 0;
  let totalRetention = 0;

  if (allCards) {
    allCards.forEach(card => {
      if (card.state === "review") masteredCards++;
      totalRetention += card.retention_score;
    });
  }
  const avgRetention = allCards && allCards.length > 0 ? Math.round((totalRetention / allCards.length) * 100) : 0;

  let topicsStarted = 0;
  let topicsMastered = 0;

  if (topicMasteries) {
    topicMasteries.forEach(t => {
      if (t.mastery_percentage !== null) {
        if (t.mastery_percentage > 0) topicsStarted++;
        if (t.mastery_percentage >= 80) topicsMastered++;
      }
    });
  }

  // Aggregate time and heatmap
  let totalStudyTimeSeconds = 0;
  const heatmapCounts = new Map<string, number>();
  
  reviewHistory.forEach(r => {
    totalStudyTimeSeconds += r.response_time_seconds || 0;
    const date = new Date(r.reviewed_at).toISOString().split('T')[0];
    heatmapCounts.set(date, (heatmapCounts.get(date) || 0) + 1);
  });

  const heatmapArray = Array.from(heatmapCounts.entries()).map(([date, count]) => ({ date, count }));

  const dailyLimit = profile?.daily_review_limit || 50;
  const streak = profile?.streak || 0;
  const cardsDueToday = dueCount || 0;
  const newCards = newCardsCount || 0;
  const completedToday = reviewsCompletedToday || 0;

  const cetReadiness = readinessMetrics.overallScore;
  const insights = await generateStudyInsights(user.id, readinessMetrics);

  // Merge recent activity
  const recentEvents: ActivityEvent[] = [];
  
  attempts.forEach((a: any) => {
    const scorePct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
    recentEvents.push({
      id: `quiz-${a.id}`,
      type: 'quiz',
      title: 'Practice Quiz',
      description: `${a.score} / ${a.total} correct`,
      timestamp: a.created_at,
      score: scorePct
    });
  });

  mockExams.forEach((a: any) => {
    const scorePct = a.score_data?.totalQuestions > 0 ? Math.round((a.score_data.totalScore / a.score_data.totalQuestions) * 100) : 0;
    recentEvents.push({
      id: `exam-${a.id}`,
      type: 'exam',
      title: 'Mock Exam',
      description: `${a.score_data?.totalScore || 0} / ${a.score_data?.totalQuestions || 0} correct`,
      timestamp: a.created_at,
      score: scorePct
    });
  });

  // Take the last few review sessions
  reviewHistory.slice(-5).forEach((r) => {
    recentEvents.push({
      id: `rev-${r.id}`,
      type: 'review',
      title: 'Flashcard Review',
      description: r.rating === 'good' || r.rating === 'easy' ? 'Recalled successfully' : 'Forgot card',
      timestamp: r.reviewed_at
    });
  });

  recentEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

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
          isEmpty={!mockExams || mockExams.length === 0}
          emptyState={<NoMockExamsEmpty />}
        >
          <div className="flex flex-col items-center justify-center py-6 gap-4">
            <AccuracyRing accuracy={cetReadiness} size={140} label="Readiness" />
            <div className="flex flex-col items-center gap-1 text-sm text-[var(--muted)]">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[var(--color-secondary)]" />
                <span>{mockExams.length} Exams Taken</span>
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
          totalTopics={topicMasteries?.length || 0}
          studyTimeSeconds={totalStudyTimeSeconds}
          cardsMastered={masteredCards}
          mockExamsCompleted={mockExams.length}
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