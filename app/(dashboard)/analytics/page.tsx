import { createClient } from "@/lib/supabase/server";
import { AnalyticsChart } from "@/components/domain/AnalyticsChart";
import { StudyInsights } from "@/components/domain/StudyInsights";
import { MemoryForecast } from "@/components/domain/MemoryForecast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Target, TrendingUp, Zap } from "lucide-react";
import { calculateReadiness } from "@/lib/intelligence/readiness";
import { generateStudyInsights } from "@/lib/intelligence/insights";
import { StudyInsightsList } from "@/components/domain/StudyInsightsList";
import { getUser } from "@/lib/auth";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    return null;
  }

  const [
    { data: examAttempts },
    { data: weakCards },
    { data: reviewHistory },
    { data: allUserCards },
    readinessMetrics
  ] = await Promise.all([
    supabase.from("mock_exam_attempts").select("created_at, score_data").eq("user_id", user.id).order("created_at", { ascending: true }),
    supabase.from("user_cards").select(`
      ease_factor,
      questions (
        topics (
          name,
          subjects (
            name
          )
        )
      )
    `).eq("user_id", user.id).lt("ease_factor", 2.3).order("ease_factor", { ascending: true }).limit(50),
    supabase.from("review_history").select("time_spent_secs, reviewed_at, rating").eq("user_id", user.id),
    supabase.from("user_cards").select("next_review, retention_score").eq("user_id", user.id),
    calculateReadiness(user.id)
  ]);

  // Aggregate by topic to find the weakest ones
  const topicStruggleMap: Record<string, { subject: string; count: number; avgEase: number }> = {};

  if (weakCards) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    weakCards.forEach((card: any) => {
      const q = Array.isArray(card.questions) ? card.questions[0] : card.questions;
      if (!q || !q.topics) return;

      const topic = Array.isArray(q.topics) ? q.topics[0] : q.topics;
      const subject = Array.isArray(topic.subjects) ? topic.subjects[0] : topic.subjects;

      const topicName = topic.name;
      const subjectName = subject?.name || "General";

      if (!topicStruggleMap[topicName]) {
        topicStruggleMap[topicName] = { subject: subjectName, count: 0, avgEase: 0 };
      }

      topicStruggleMap[topicName].count += 1;
      topicStruggleMap[topicName].avgEase += card.ease_factor;
    });
  }

  // Convert map to sorted array
  const weakestTopics = Object.entries(topicStruggleMap)
    .map(([name, data]) => ({
      name,
      subject: data.subject,
      struggleScore: data.count, // A simplified metric: number of cards struggling in this topic
      avgEase: data.avgEase / data.count,
    }))
    .sort((a, b) => b.struggleScore - a.struggleScore) // Sort by most struggles
    .slice(0, 5); // Top 5 weakest

  // Map to chart data format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartData = (examAttempts || []).map((attempt: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scoreData = attempt.score_data as any;
    const accuracy =
      scoreData.totalQuestions > 0
        ? Math.round((scoreData.totalScore / scoreData.totalQuestions) * 100)
        : 0;

    return {
      date: new Date(attempt.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      score: accuracy,
    };
  });
  const insights = await generateStudyInsights(user.id, readinessMetrics);
  const momentum = readinessMetrics.trend === "improving" ? "Improving" : readinessMetrics.trend === "declining" ? "Declining" : "Stable";

  const forecastCounts = new Map<string, number>();
  const today = new Date();
  today.setHours(0,0,0,0);
  let totalNext30Days = 0;

  if (allUserCards) {
    allUserCards.forEach(c => {
      if (c.next_review) {
        const d = new Date(c.next_review);
        const diffTime = d.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 30) {
          totalNext30Days++;
          if (diffDays <= 7) {
            const dateStr = d.toISOString().split("T")[0];
            forecastCounts.set(dateStr, (forecastCounts.get(dateStr) || 0) + 1);
          }
        }
      }
    });
  }

  const forecastData: { day: string; count: number }[] = [];
  for (let i = 0; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString(undefined, { weekday: "short" });
    forecastData.push({
      day: i === 0 ? "Today" : dayName,
      count: forecastCounts.get(dateStr) || 0
    });
  }

  const getMomentumColor = (m: string) => {
    if (m === "Improving") return "text-[var(--color-success)]";
    if (m === "Declining") return "text-[var(--color-danger)]";
    if (m === "Needs Attention") return "text-[var(--color-warning)]";
    return "text-[var(--muted)]";
  };

  return (
    <div className="max-w-5xl mx-auto py-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Analytics & Insights</h1>
        <p className="text-[var(--muted)] mt-2">
          Track your progress and identify areas for improvement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        <Card className="col-span-1 md:col-span-1 border-[var(--border)] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[var(--muted)] uppercase tracking-wider font-semibold">
              Learning Momentum
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Zap className={`w-8 h-8 ${getMomentumColor(momentum)}`} />
            <span className={`text-2xl font-bold ${getMomentumColor(momentum)}`}>
              {momentum}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--color-primary)]" />
              Mock Exam Trajectory
            </CardTitle>
            <CardDescription>Your overall accuracy over time</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart data={chartData} />
          </CardContent>
        </Card>

        {/* Weakest Topics List */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[var(--color-danger)]" />
              Focus Areas
            </CardTitle>
            <CardDescription>Topics needing attention</CardDescription>
          </CardHeader>
          <CardContent>
            {weakestTopics.length > 0 ? (
              <div className="flex flex-col gap-4">
                {weakestTopics.map((topic, i) => (
                  <div key={i} className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-sm leading-tight">{topic.name}</h4>
                      <span className="text-xs text-[var(--muted)]">{topic.subject}</span>
                    </div>
                    <div className="px-2 py-1 bg-[var(--color-danger-light)]/20 text-[var(--color-danger)] rounded text-xs font-bold whitespace-nowrap">
                      Priority
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-8 text-[var(--muted)]">
                <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">Not enough data to identify focus areas yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Intelligent Insights */}
        <div className="col-span-1 md:col-span-2">
          <StudyInsightsList insights={insights} />
        </div>

        {/* Memory Forecast */}
        <div className="col-span-1">
          <MemoryForecast forecastData={forecastData} totalNext30Days={totalNext30Days} />
        </div>
      </div>
    </div>
  );
}
