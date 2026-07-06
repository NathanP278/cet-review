import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExamSessionClient } from "../../ExamSessionClient";

export const dynamic = "force-dynamic";

export default async function ExamSessionPage(props: { params: Promise<{ attempt_id: string }> }) {
  const params = await props.params;
  const attemptId = params.attempt_id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch attempt
  const { data: attempt } = await supabase
    .from("mock_exam_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .single();

  if (!attempt) {
    redirect("/exam");
  }

  if (attempt.status === "completed") {
    redirect(`/exam/${attemptId}/results`);
  }

  const state = attempt.state as any;
  const questionIds = state.questions || [];

  if (questionIds.length === 0) {
    redirect("/exam");
  }

  // Fetch the actual questions
  const { data: questions } = await supabase
    .from("questions")
    .select(`
      id,
      content,
      answer,
      choices,
      type,
      difficulty,
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

  // Preserve the ordered array from the attempt state to prevent reshuffling
  const orderedQuestions = questionIds
    .map((id: string) => questions?.find((q) => q.id === id))
    .filter(Boolean);

  return (
    <ExamSessionClient 
      attemptId={attemptId}
      initialQuestions={orderedQuestions} 
      initialAnswers={state.answers || {}}
      initialFlagged={state.flagged || []}
      initialRemainingSeconds={state.remainingSeconds}
    />
  );
}
