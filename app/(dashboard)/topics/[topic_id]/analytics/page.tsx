import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AccuracyRing } from "@/components/domain/AccuracyRing";

interface PageProps {
  params: Promise<{
    topic_id: string;
  }>;
}

export default async function TopicAnalyticsPage({ params }: PageProps) {
  const { topic_id } = await params;
  const supabase = await createClient();
  const user = await getUser();

  if (!user) redirect("/login");

  // Fetch topic details
  const { data: topic } = await supabase
    .from("topics")
    .select("name, description, categories(subjects(name))")
    .eq("id", topic_id)
    .single();

  if (!topic) redirect("/subjects");

  const subjectName = Array.isArray(topic.categories) 
    ? "Unknown" 
    : Array.isArray(topic.categories?.subjects)
      ? "Unknown"
      : topic.categories?.subjects?.name || "Unknown";

  // Fetch mastery stats from view
  const { data: masteryData } = await supabase
    .from("topic_mastery_view")
    .select("*")
    .eq("user_id", user.id)
    .eq("topic_id", topic_id)
    .single();

  const totalCards = masteryData?.total_cards || 0;
  const masteredCards = masteryData?.mastered_cards || 0;
  const avgRetention = masteryData?.avg_retention || 0;
  const masteryPercentage = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  // Fetch granular card data for this topic
  const { data: cardsData } = await supabase
    .from("user_cards")
    .select("average_response_time, lapse_count, total_reviews")
    .eq("user_id", user.id)
    .in("question_id", (
      supabase.from("questions").select("id").eq("topic_id", topic_id)
    ) as any);

  let totalResponseTime = 0;
  let totalReviews = 0;
  let totalLapses = 0;

  if (cardsData) {
    cardsData.forEach((c) => {
      totalResponseTime += c.average_response_time * c.total_reviews;
      totalReviews += c.total_reviews;
      totalLapses += c.lapse_count;
    });
  }

  const avgResponseTime = totalReviews > 0 ? Math.round(totalResponseTime / totalReviews) : 0;
  const correctRate = totalReviews > 0 ? Math.round(((totalReviews - totalLapses) / totalReviews) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto py-8 flex flex-col gap-8">
      <div>
        <span className="text-sm text-[var(--color-primary)] font-semibold uppercase tracking-wider">{subjectName}</span>
        <h1 className="text-3xl font-bold font-display mt-1">{topic.name}</h1>
        <p className="text-[var(--muted)] mt-2">
          {topic.description || "Detailed analytics for this topic."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Topic Mastery</CardTitle>
            <CardDescription>Based on SM-2 spaced repetition</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6 gap-4">
            <AccuracyRing accuracy={masteryPercentage} size={140} label="Mastery" />
            <div className="flex gap-4 text-sm text-[var(--muted)]">
              <span>{masteredCards} Mastered</span>
              <span>•</span>
              <span>{totalCards} Total Cards</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Accuracy and speed in this topic</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 py-6">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold">Review Accuracy</span>
                <span>{correctRate}%</span>
              </div>
              <div className="h-2 w-full bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--color-success)] transition-all"
                  style={{ width: `${correctRate}%` }}
                />
              </div>
              <p className="text-xs text-[var(--muted)] mt-2">{totalReviews} total reviews logged</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold">Avg. Response Time</span>
                <span>{avgResponseTime}s</span>
              </div>
              <div className="h-2 w-full bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--color-primary)] transition-all"
                  style={{ width: `${Math.min(100, (avgResponseTime / 60) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-[var(--muted)] mt-2">Lower is better. Represents average time to answer.</p>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold">Retention Score</span>
                <span>{Math.round(avgRetention * 100)}%</span>
              </div>
              <p className="text-xs text-[var(--muted)]">Memory strength for this topic.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
