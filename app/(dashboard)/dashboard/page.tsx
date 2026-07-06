import { createClient } from "@/lib/supabase/server";
import { AccuracyRing } from "@/components/domain/AccuracyRing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Flame, PlayCircle, TrendingUp, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch some basic stats for the dashboard (mocked/aggregated for MVP)
  // In a full app, we would query the user_cards for due cards and quiz_attempts for accuracy
  const { data: attemptsData } = await supabase
    .from("quiz_attempts")
    .select("score, total")
    .eq("user_id", user.id);

  const attempts = attemptsData as { score: number; total: number }[] | null;

  let totalScore = 0;
  let totalQuestions = 0;

  if (attempts) {
    attempts.forEach((attempt) => {
      totalScore += attempt.score;
      totalQuestions += attempt.total;
    });
  }

  // Fetch the count of flashcards due for review today
  const now = new Date().toISOString();
  const { count: dueCount } = await supabase
    .from("user_cards")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .lte("next_review", now);

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak")
    .eq("id", user.id)
    .single();

  // Fetch M16 Learning Stats
  const { data: progressData } = await supabase
    .from("user_progress")
    .select("status, study_time_seconds")
    .eq("user_id", user.id);

  const progressStats = { started: 0, completed: 0, time: 0 };
  if (progressData) {
    progressData.forEach((p) => {
      if (p.status === "started") progressStats.started += 1;
      if (p.status === "completed") progressStats.completed += 1;
      progressStats.time += p.study_time_seconds || 0;
    });
  }

  const { count: notesCount } = await supabase
    .from("user_notes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const overallAccuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  const cardsDueToday = dueCount || 0;
  const streak = profile?.streak || 0;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-[var(--foreground)]">
            Welcome back, {user.email?.split("@")[0]}!
          </h1>
          <p className="text-[var(--muted)] mt-1">Here is your daily study overview.</p>
        </div>
        <div className="flex items-center gap-3 bg-[var(--surface)] px-4 py-2 rounded-lg border border-[var(--border)] shadow-sm">
          <Flame className="h-5 w-5 text-[var(--color-warning)]" />
          <span className="font-semibold">{streak} Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 border-t-4 border-t-[var(--color-primary)]">
          <CardHeader className="pb-2">
            <CardTitle>Exam Readiness</CardTitle>
            <CardDescription>Based on your recent practice</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 gap-4">
            {totalQuestions > 0 ? (
              <>
                <AccuracyRing accuracy={overallAccuracy} size={140} label="Mastery" />
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <TrendingUp className="h-4 w-4 text-[var(--color-success)]" />
                  <span>+2% from last week</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-2 h-[140px]">
                <span className="text-2xl font-bold text-[var(--muted)]">0%</span>
                <span className="text-sm text-[var(--muted)]">Not Enough Data Yet</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Today&apos;s Study Plan</CardTitle>
            <CardDescription>Optimized by Spaced Repetition (SM-2)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)]/50 border border-[var(--border)]">
              <div className="p-3 bg-[var(--color-primary)] rounded-full text-white shrink-0">
                <Clock className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Daily Review Due</h3>
                <p className="text-sm text-[var(--muted)] mb-3">
                  You have <strong className="text-[var(--foreground)]">{cardsDueToday}</strong>{" "}
                  concepts due for review today across Math and Science.
                </p>
                <Link href="/practice">
                  <Button className="gap-2 w-full sm:w-auto">
                    <PlayCircle className="h-4 w-4" />
                    Start Review Session
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-transparent border border-[var(--border)]">
              <div className="p-3 bg-[var(--color-slate-200)] dark:bg-[var(--color-slate-800)] rounded-full text-[var(--muted)] shrink-0">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Explore New Topics</h3>
                <p className="text-sm text-[var(--muted)] mb-3">
                  Ready for more? Dive into new subjects to expand your knowledge base.
                </p>
                <Link href="/subjects">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Browse Subjects
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Journey Stats */}
      <div>
        <h2 className="text-xl font-bold font-display mb-4">Learning Journey</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider">Topics Started</span>
              <span className="text-2xl font-bold text-[var(--foreground)]">{progressStats.started}</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider">Topics Mastered</span>
              <span className="text-2xl font-bold text-[var(--foreground)]">{progressStats.completed}</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider">Notes Written</span>
              <span className="text-2xl font-bold text-[var(--foreground)]">{notesCount}</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider">Study Time</span>
              <span className="text-2xl font-bold text-[var(--foreground)]">
                {Math.round(progressStats.time / 60)} mins
              </span>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold font-display mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-0">
            {attempts && attempts.length > 0 ? (
              <div className="divide-y divide-[var(--border)]">
                {attempts
                  .slice(-5)
                  .reverse()
                  .map((attempt, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 hover:bg-[var(--color-slate-100)] dark:hover:bg-[var(--color-slate-800)]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${attempt.score / attempt.total >= 0.7 ? "bg-[var(--color-success)]" : "bg-[var(--color-warning)]"}`}
                        />
                        <span className="font-medium">Mixed Practice Quiz</span>
                      </div>
                      <span className="text-sm font-semibold text-[var(--muted)]">
                        {attempt.score} / {attempt.total}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-8 text-center text-[var(--muted)]">
                No activity yet. Complete a practice session to see it here!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
