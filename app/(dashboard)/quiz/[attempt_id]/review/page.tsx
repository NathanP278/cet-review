import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function QuizReviewPage({
  params,
}: {
  params: Promise<{ attempt_id: string }>;
}) {
  const { attempt_id } = await params;
  const supabase = await createClient();
  const user = await getUser();

  if (!user) return notFound();

  const { data: attempt } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("id", attempt_id)
    .eq("user_id", user.id)
    .single();

  if (!attempt) return notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const details = attempt.details as any[] | null;

  if (!details || details.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold">No detailed history available</h1>
        <p className="text-[var(--muted)] mt-2">This attempt was recorded before detailed tracking was enabled.</p>
        <Link href="/dashboard" className="text-blue-500 mt-4 block hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Fetch the actual questions to get content and choices
  const questionIds = details.map((d) => d.questionId);
  const { data: questions } = await supabase
    .from("questions")
    .select("id, content, choices")
    .in("id", questionIds);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-16">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-display">Quiz Review</h1>
        <p className="text-[var(--muted)]">
          Score: <span className="font-bold text-[var(--foreground)]">{attempt.score} / {attempt.total}</span>
          <span className="mx-2">•</span>
          {new Date(attempt.created_at || "").toLocaleDateString(undefined, {
            weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
          })}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {details.map((detail, index) => {
          const q = questions?.find((q) => q.id === detail.questionId);
          if (!q) return null;

          const isCorrect = detail.isCorrect;

          return (
            <Card key={detail.questionId} className={`border-l-4 ${isCorrect ? "border-l-[var(--color-success)]" : "border-l-[var(--color-danger)]"}`}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="mt-1 shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-[var(--color-success)]" />
                    ) : (
                      <XCircle className="h-6 w-6 text-[var(--color-danger)]" />
                    )}
                  </div>
                  <div className="flex flex-col gap-4 w-full">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider">
                        Question {index + 1}
                      </span>
                      {detail.timeSpent && (
                        <span className="text-xs text-[var(--muted)]">{detail.timeSpent}s</span>
                      )}
                    </div>
                    
                    <div className="text-lg font-medium prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: q.content }} />

                    <div className="flex flex-col gap-2 mt-2">
                      <div className="text-sm font-semibold text-[var(--muted)]">Your Answer:</div>
                      <div className={`p-3 rounded-md border ${isCorrect ? "bg-[var(--color-success-light)]/20 border-[var(--color-success)] text-[var(--color-success)]" : "bg-[var(--color-danger-light)]/20 border-[var(--color-danger)] text-[var(--color-danger)]"}`}>
                        {detail.userAnswer || "Skipped / No Answer"}
                      </div>
                    </div>

                    {!isCorrect && (
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="text-sm font-semibold text-[var(--muted)]">Correct Answer:</div>
                        <div className="p-3 rounded-md border bg-[var(--color-success-light)]/20 border-[var(--color-success)] text-[var(--color-success)]">
                          {detail.correctAnswer}
                        </div>
                      </div>
                    )}

                    {detail.explanation && (
                      <div className="mt-4 p-4 rounded-md bg-[var(--surface)] border border-[var(--border)]">
                        <span className="text-sm font-bold uppercase tracking-wider mb-2 block text-[var(--color-primary)]">Explanation</span>
                        <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: detail.explanation }} />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
