import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExamResults } from "@/components/domain/ExamResults";
import { submitExam } from "@/app/actions/exam";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, History, Sparkles } from "lucide-react";
import { analyzeMockExam } from "@/app/actions/ai";

export default async function ExamResultsPage(props: { params: Promise<{ attempt_id: string }> }) {
  const params = await props.params;
  const attemptId = params.attempt_id;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let { data: attempt } = await supabase
    .from("mock_exam_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .single();

  if (!attempt) redirect("/exam");

  // Auto-grade if somehow we reached here and it's not completed
  if (attempt.status !== "completed") {
    await submitExam(attemptId);
    
    // Refetch
    const { data: updatedAttempt } = await supabase
      .from("mock_exam_attempts")
      .select("*")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .single();
      
    if (!updatedAttempt) redirect("/exam");
    attempt = updatedAttempt;
  }

  const scoreData = attempt.score_data as any;

  if (!scoreData) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-xl font-bold text-[var(--color-danger)]">Failed to load exam results</h2>
        <p className="text-[var(--muted)] mt-2">The exam may not have been graded properly.</p>
        <Link href="/exam" className="mt-6">
          <Button>Return to Exams</Button>
        </Link>
      </div>
    );
  }

  const aiDebrief = await analyzeMockExam(attemptId);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-6 rounded-2xl flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-full shadow-sm">
            <Sparkles className="h-6 w-6 text-purple-700 dark:text-purple-300" />
          </div>
          <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
            AI Exam Debrief
            <span className="bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Coach</span>
          </h3>
        </div>
        <div className="mt-2 text-sm md:text-base text-purple-900 dark:text-purple-100 leading-relaxed font-medium space-y-4">
          {aiDebrief.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </div>

      <ExamResults
        totalScore={scoreData.totalScore}
        totalQuestions={scoreData.totalQuestions}
        subjectScores={scoreData.subjectScores || []}
      />

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
        <Link href={`/exam/${attemptId}/review`}>
          <Button size="lg" className="w-full sm:w-auto gap-2">
            Review Questions
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/exam/history">
          <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
            <History className="h-4 w-4" />
            View History
          </Button>
        </Link>
      </div>
    </div>
  );
}
