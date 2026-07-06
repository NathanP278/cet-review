import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AccuracyRing } from "@/components/domain/AccuracyRing";
import { BookOpen, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: {
    subject_id: string;
  };
}

export default async function SubjectAnalyticsPage({ params }: PageProps) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) redirect("/login");

  // Fetch subject details
  const { data: subject } = await supabase
    .from("subjects")
    .select("name, description")
    .eq("id", params.subject_id)
    .single();

  if (!subject) redirect("/subjects");

  // Fetch mastery stats from view
  const { data: masteryData } = await supabase
    .from("subject_mastery_analytics_view")
    .select("*")
    .eq("user_id", user.id)
    .eq("subject_id", params.subject_id)
    .single();

  const totalCards = masteryData?.total_cards || 0;
  const masteredCards = masteryData?.mastered_cards || 0;
  const avgRetention = masteryData?.avg_retention || 0;
  const masteryPercentage = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  // Fetch weakest topics in this subject
  const { data: weakTopicsData } = await supabase
    .from("topic_mastery_view")
    .select("topic_id, topic_name, mastery_percentage")
    .eq("user_id", user.id)
    .eq("subject_id", params.subject_id)
    .order("mastery_percentage", { ascending: true })
    .limit(3);

  return (
    <div className="max-w-4xl mx-auto py-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-display">{subject.name} Analytics</h1>
        <p className="text-[var(--muted)] mt-2">
          Deep dive into your performance for this subject.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Subject Mastery</CardTitle>
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
            <CardTitle>Retention Health</CardTitle>
            <CardDescription>Average memory retention rate</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6 gap-4">
            <AccuracyRing accuracy={Math.round(avgRetention * 100) || 0} size={140} label="Retention" />
            <p className="text-sm text-center text-[var(--muted)] max-w-[200px]">
              This represents how well you are recalling information during reviews.
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold font-display mb-4">Suggested Focus Areas</h2>
        <Card>
          <CardContent className="p-0 divide-y divide-[var(--border)]">
            {weakTopicsData && weakTopicsData.length > 0 ? (
              weakTopicsData.map((topic) => (
                <div key={topic.topic_id} className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{topic.topic_name}</h3>
                    <p className="text-sm text-[var(--muted)] flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-[var(--color-warning)]" />
                      {topic.mastery_percentage}% Mastery
                    </p>
                  </div>
                  <Link href={`/topics/${topic.topic_id}/analytics`}>
                    <Button variant="outline" size="sm">View Topic</Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[var(--muted)]">
                Not enough data yet. Complete more reviews!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
