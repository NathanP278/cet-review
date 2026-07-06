import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Clock, Award } from "lucide-react";

export default async function ExamHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: exams } = await supabase
    .from("mock_exam_attempts")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto py-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-display">Exam History</h1>
        <p className="text-[var(--muted)] mt-2">
          Review your past mock exam attempts and track your progress.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Past Attempts</CardTitle>
          <CardDescription>Your completed simulated CET exams.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!exams || exams.length === 0 ? (
            <div className="p-8 text-center text-[var(--muted)]">
              No completed exams yet. Start a new mock exam to see your history here!
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {exams.map((exam) => {
                const scoreData = exam.score_data as any;
                const config = exam.config as any;
                
                const score = scoreData?.totalScore || 0;
                const total = scoreData?.totalQuestions || 1;
                const percent = Math.round((score / total) * 100);
                
                let modeLabel = "Mock Exam";
                if (config?.mode === "full") modeLabel = "Full CET Mock";
                if (config?.mode === "subject") modeLabel = "Subject Focus";
                if (config?.mode === "quick") modeLabel = "Quick Practice";
                if (config?.mode === "custom") modeLabel = "Custom Mock";

                return (
                  <div key={exam.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-raised)] transition-colors">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${percent >= 70 ? "bg-[var(--color-success-light)]/20 text-[var(--color-success-dark)]" : "bg-[var(--color-warning-light)]/20 text-[var(--color-warning-dark)]"}`}>
                          {percent}% Score
                        </span>
                        <span className="font-semibold">{modeLabel}</span>
                      </div>
                      <span className="text-sm text-[var(--muted)] flex items-center gap-4">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(exam.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Award className="h-3 w-3" /> {score} / {total} Questions</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link href={`/exam/${exam.id}/results`}>
                        <Button variant="outline" size="sm">Results</Button>
                      </Link>
                      <Link href={`/exam/${exam.id}/review`}>
                        <Button variant="default" size="sm" className="gap-2">
                          Review <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
