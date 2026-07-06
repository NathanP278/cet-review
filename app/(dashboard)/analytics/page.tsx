import { createClient } from "@/lib/supabase/server";
import { AnalyticsChart } from "@/components/domain/AnalyticsChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Target, TrendingUp } from "lucide-react";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 1. Fetch Mock Exam Attempts for the chart
  const { data: examAttempts } = await supabase
    .from("mock_exam_attempts")
    .select("created_at, score_data")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  // Map to chart data format
  const chartData = (examAttempts || []).map((attempt: any) => {
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

  // 2. Weakest Topics Analysis
  // Fetch user_cards with low ease_factor (struggling topics)
  const { data: weakCards } = await supabase
    .from("user_cards")
    .select(
      `
      ease_factor,
      questions (
        topics (
          name,
          subjects (
            name
          )
        )
      )
    `
    )
    .eq("user_id", user.id)
    .lt("ease_factor", 2.3) // Anything below 2.3 is struggling (starts at 2.5)
    .order("ease_factor", { ascending: true })
    .limit(50);

  // Aggregate by topic to find the weakest ones
  const topicStruggleMap: Record<string, { subject: string; count: number; avgEase: number }> = {};

  if (weakCards) {
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

  return (
    <div className="max-w-5xl mx-auto py-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Analytics & Insights</h1>
        <p className="text-[var(--muted)] mt-2">
          Track your progress and identify areas for improvement.
        </p>
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
      </div>
    </div>
  );
}
