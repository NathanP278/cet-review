import { fetchQuizQuestions } from "@/app/actions/quiz";
import { QuizEngine } from "@/components/domain/QuizEngine";
import { createClient } from "@/lib/supabase/server";

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; subject?: string; limit?: string }>;
}) {
  const { topic, subject, limit } = await searchParams;
  const supabase = await createClient();

  // If no params are passed, we could show a "Select Topic" configuration UI.
  // For the MVP, if no params are passed, we just fetch random questions across the DB
  const questions = await fetchQuizQuestions({
    topicId: topic,
    subjectId: subject,
    limit: limit ? parseInt(limit, 10) : 10,
  });

  // Fetch contextual title
  let contextTitle = "Mixed Practice";
  if (topic) {
    const { data } = await supabase.from("topics").select("name").eq("id", topic).single();
    if (data) contextTitle = `${data.name} Practice`;
  } else if (subject) {
    const { data } = await supabase.from("subjects").select("name").eq("id", subject).single();
    if (data) contextTitle = `${data.name} Practice`;
  }

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-100px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">{contextTitle}</h1>
        <p className="text-[var(--muted)]">Focus up. Your progress here powers your spaced repetition algorithm.</p>
      </div>

      <QuizEngine questions={questions} />
    </div>
  );
}
