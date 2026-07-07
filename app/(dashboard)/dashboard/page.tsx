import { createClient } from "@/lib/supabase/server";
import { AccuracyRing } from "@/components/domain/AccuracyRing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Flame, BookOpen, TrendingUp, CalendarDays } from "lucide-react";
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
    readinessMetrics
  ] = await Promise.all([
    supabase.from("quiz_attempts").select("id, score, total, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("mock_exam_attempts").select("id, score_data, created_at").eq("status", "completed").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("review_history").select("*", { count: "exact", head: true }).eq("user_id", user.id).gte("reviewed_at", startOfDay),
    supabase.from("user_cards").select("state, retention_score").eq("user_id", user.id),
    supabase.from("profiles").select("streak, daily_review_limit, settings").eq("id", user.id).single(),
    supabase.from("topic_mastery_view").select("mastery_percentage").eq("user_id", user.id),
    supabase.from("review_history").select("id, reviewed_at, response_time_seconds, grade").eq("user_id", user.id).gte("reviewed_at", oneYearAgoStr),
    supabase.from("user_cards").select("*", { count: "exact", head: true }).eq("user_id", user.id).in("state", ["relearning", "review"]).lte("next_review", nowStr),
    supabase.from("user_cards").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("state", "learning"),
    calculateReadiness(user.id)
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

  // Take the last few review sessions (grouping individual reviews if possible, but let's just show raw reviews if needed, or skip reviews if it floods the feed)
  // For the MVP feed, we'll only show the latest 5 reviews as distinct events to not overwhelm.
  reviewHistory.slice(-5).forEach((r) => {
    recentEvents.push({
      id: `rev-${r.id}`,
      type: 'review',
      title: 'Flashcard Review',
      description: r.grade >= 3 ? 'Recalled successfully' : 'Forgot card',
      timestamp: r.reviewed_at
    });
  });

  recentEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-[var(--foreground)]">
            Command Center
          </h1>
          <p className="text-[var(--muted)] mt-1">Your comprehensive view of CET exam readiness and study progress.</p>
        </div>
        <div className="flex items-center gap-3 bg-[var(--surface)] px-4 py-2 rounded-lg border border-[var(--border)] shadow-sm">
          <Flame className="h-5 w-5 text-[var(--color-warning)]" />
          <span className="font-semibold">{streak} Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CET Readiness */}
        <Card className="col-span-1 border-t-4 border-t-[var(--color-primary)] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>CET Readiness</CardTitle>
            <CardDescription>
              {readinessMetrics.confidenceScore < 30 ? "Need more data" : readinessMetrics.trend === "improving" ? "Trending Upward" : "Based on AI Model"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 gap-4">
            <AccuracyRing accuracy={cetReadiness} size={140} label="Readiness" />
            <div className="flex flex-col items-center gap-1 text-sm text-[var(--muted)]">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[var(--color-secondary)]" />
                <span>{mockExams.length} Exams Taken</span>
              </div>
              {readinessMetrics.estimatedExamDayScore > 0 && (
                <span className="text-xs">Est. Exam Day Score: <strong className="text-[var(--foreground)]">{readinessMetrics.estimatedExamDayScore}%</strong></span>
              )}
            </div>
            {(!mockExams || mockExams.length === 0) && (
              <Link href="/exam">
                <Button variant="outline" size="sm" className="mt-2 text-xs h-8">Take a Mock Exam</Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Memory Health */}
        <Card className="col-span-1 border-t-4 border-t-[var(--color-secondary)] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Memory Health</CardTitle>
            <CardDescription>Based on SM-2 Spaced Repetition</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 gap-4">
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
          </CardContent>
        </Card>

        {/* Today's Study Plan */}
        <div className="col-span-1">
          <StudyPlan 
            dueReviews={cardsDueToday}
            newCards={newCards}
            completedReviews={completedToday}
            dailyReviewLimit={dailyLimit}
            avgTimePerCardSecs={15}
          />
        </div>
      </div>

      {/* M20 Study Insights Engine */}
      <div className="w-full">
        <StudyInsightsList insights={insights} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LearningJourney 
          topicsStarted={topicsStarted}
          topicsMastered={topicsMastered}
          totalTopics={topicMasteries?.length || 0}
          studyTimeSeconds={totalStudyTimeSeconds}
          cardsMastered={masteredCards}
          mockExamsCompleted={mockExams.length}
        />
        
        <RecentActivity events={recentEvents} />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-6 h-6 text-[var(--color-primary)]" />
          <h2 className="text-xl font-bold font-display">Study Activity Heatmap</h2>
        </div>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <ReviewHeatmap data={heatmapArray} days={365} />
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
