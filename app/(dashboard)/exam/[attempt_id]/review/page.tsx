import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExamReviewClient } from "./ExamReviewClient";

export default async function ExamReviewPage(props: { params: Promise<{ attempt_id: string }> }) {
  const params = await props.params;
  const attemptId = params.attempt_id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: attempt } = await supabase
    .from("mock_exam_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .single();

  if (!attempt || attempt.status !== "completed") {
    redirect(`/exam`);
  }

  const state = attempt.state as any;
  const questionIds: string[] = state.questions || [];
  const answers: Record<number, string> = state.answers || {};
  const flagged: number[] = state.flagged || [];

  const { data: questions } = await supabase
    .from("questions")
    .select(`
      id,
      content,
      answer,
      choices,
      explanation,
      topics (
        id,
        name,
        subjects (
          id,
          name
        )
      )
    `)
    .in("id", questionIds);

  const orderedQuestions = questionIds
    .map((id: string) => questions?.find((q) => q.id === id))
    .filter(Boolean);

  return (
    <ExamReviewClient 
      questions={orderedQuestions}
      userAnswers={answers}
      flaggedIndexes={flagged}
      attemptId={attemptId}
    />
  );
}
