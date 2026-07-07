import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopicAccordion } from "@/components/domain/TopicAccordion";
import { AccuracyRing } from "@/components/domain/AccuracyRing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";

export default async function SubjectHubPage({
  params,
}: {
  params: Promise<{ subject_id: string }>;
}) {
  const { subject_id } = await params;
  const supabase = await createClient();

  // Fetch subject details
  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", subject_id)
    .single();

  if (subjectError || !subject) {
    notFound();
  }

  // Fetch related categories to get topics
  const { data: categories } = await supabase
    .from("categories")
    .select("id")
    .eq("subject_id", subject_id);

  const categoryIds = categories?.map((c) => c.id) || [];

  const { data: { user } } = await supabase.auth.getUser();

  let topics: { id: string; name: string }[] = [];
  if (categoryIds.length > 0) {
    const { data } = await supabase
      .from("topics")
      .select("*")
      .in("category_id", categoryIds)
      .order("name");
    topics = data || [];
  }

  // Fetch Subject Mastery
  let overallAccuracy = 0;
  if (user) {
    const { data: subjectMastery } = await supabase
      .from("subject_mastery_analytics_view")
      .select("mastery_percentage")
      .eq("user_id", user.id)
      .eq("subject_id", subject_id)
      .single();
    if (subjectMastery && subjectMastery.mastery_percentage !== null) {
      overallAccuracy = Math.round(subjectMastery.mastery_percentage);
    }
  }

  // Fetch Topic Masteries
  let topicMasteryMap: Record<string, number> = {};
  if (user && topics.length > 0) {
    const topicIds = topics.map((t) => t.id);
    const { data: masteries } = await supabase
      .from("topic_mastery_view")
      .select("topic_id, mastery_percentage")
      .eq("user_id", user.id)
      .in("topic_id", topicIds);

    if (masteries) {
      topicMasteryMap = masteries.reduce((acc, curr) => {
        if (curr.topic_id) {
          acc[curr.topic_id] = curr.mastery_percentage ? Math.round(curr.mastery_percentage) : 0;
        }
        return acc;
      }, {} as Record<string, number>);
    }
  }

  // Fetch Official Resources (Notes)
  let officialNotesMap: Record<string, string> = {};
  if (topics.length > 0) {
    const topicIds = topics.map((t) => t.id);
    const { data: resources } = await supabase
      .from("topic_resources")
      .select("topic_id, study_notes")
      .in("topic_id", topicIds);

    if (resources) {
      officialNotesMap = resources.reduce((acc, curr) => {
        if (curr.topic_id && curr.study_notes) {
          acc[curr.topic_id] = curr.study_notes;
        }
        return acc;
      }, {} as Record<string, string>);
    }
  }

  // Fetch User Notes
  let userNotesMap: Record<string, string> = {};
  if (user && topics.length > 0) {
    const topicIds = topics.map((t) => t.id);
    const { data: uNotes } = await supabase
      .from("user_notes")
      .select("topic_id, content")
      .eq("user_id", user.id)
      .in("topic_id", topicIds);

    if (uNotes) {
      userNotesMap = uNotes.reduce((acc, curr) => {
        if (curr.topic_id && curr.content) {
          acc[curr.topic_id] = curr.content;
        }
        return acc;
      }, {} as Record<string, string>);
    }
  }

  // Generate progress and attach notes for topics
  const topicsWithMockProgress =
    topics?.map((t) => ({
      id: t.id,
      name: t.name,
      progress: topicMasteryMap[t.id] || 0,
      notes: officialNotesMap[t.id] || null,
      userNoteContent: userNotesMap[t.id] || null,
    })) || [];

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <Link
        href="/subjects"
        className="inline-flex items-center text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors w-fit"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Subjects
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold font-display mb-3">{subject.name}</h1>
          <p className="text-[var(--muted)] text-lg max-w-xl">
            {subject.description ||
              "Master the concepts and build your confidence through targeted practice."}
          </p>
        </div>

        <Card className="shrink-0">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">
                Overall Mastery
              </span>
              <span className="text-xs text-[var(--muted)] max-w-[150px]">
                Based on recent practice sessions and quizzes
              </span>
            </div>
            <AccuracyRing accuracy={overallAccuracy} size={80} label="Accuracy" />
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 py-4 border-y border-[var(--border)]">
        <Button size="lg" className="gap-2">
          <Play className="h-5 w-5" />
          Take Mixed Quiz
        </Button>
        <span className="text-sm text-[var(--muted)]">
          Generates a 20-item quiz pulling from all topics below using Spaced Repetition.
        </span>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Topics</h2>
        <div className="flex flex-col gap-3">
          {topicsWithMockProgress.map((topic) => (
            <TopicAccordion key={topic.id} topic={topic} />
          ))}
          {topicsWithMockProgress.length === 0 && (
            <p className="text-[var(--muted)] italic">No topics found for this subject.</p>
          )}
        </div>
      </div>
    </div>
  );
}
