import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Target, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ReviewSummaryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch today's reviews
  const today = new Date();
  today.setHours(0,0,0,0);

  const { data: todayReviews } = await supabase
    .from("review_history")
    .select("rating, response_time_seconds, ease_factor")
    .eq("user_id", user.id)
    .gte("reviewed_at", today.toISOString());

  if (!todayReviews || todayReviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold font-display mb-2">No reviews completed today</h2>
        <Link href="/review">
          <Button>Back to Review</Button>
        </Link>
      </div>
    );
  }

  const totalReviews = todayReviews.length;
  let correctCount = 0;
  let totalTime = 0;
  const ratingCounts = { again: 0, hard: 0, good: 0, easy: 0 };

  todayReviews.forEach(r => {
    if (r.rating === "good" || r.rating === "easy") correctCount++;
    if (r.rating === "again") ratingCounts.again++;
    if (r.rating === "hard") ratingCounts.hard++;
    if (r.rating === "good") ratingCounts.good++;
    if (r.rating === "easy") ratingCounts.easy++;
    totalTime += (r.response_time_seconds || 0);
  });

  const accuracy = Math.round((correctCount / totalReviews) * 100);
  const avgTime = (totalTime / totalReviews).toFixed(1);

  return (
    <div className="max-w-3xl mx-auto py-12 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-success-light)]/20 text-[var(--color-success)] mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold font-display mb-2">Session Complete!</h1>
        <p className="text-[var(--muted)] text-lg">Great job maintaining your learning momentum.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-[var(--border)] shadow-sm">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <Target className="w-6 h-6 text-[var(--color-primary)]" />
            <span className="text-3xl font-bold">{totalReviews}</span>
            <span className="text-xs text-[var(--muted)] uppercase font-semibold">Cards Reviewed</span>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)] shadow-sm">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <Zap className="w-6 h-6 text-[var(--color-success)]" />
            <span className="text-3xl font-bold">{accuracy}%</span>
            <span className="text-xs text-[var(--muted)] uppercase font-semibold">Accuracy</span>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)] shadow-sm">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <Clock className="w-6 h-6 text-[var(--color-warning)]" />
            <span className="text-3xl font-bold">{avgTime}s</span>
            <span className="text-xs text-[var(--muted)] uppercase font-semibold">Avg Time</span>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)] shadow-sm">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-[var(--color-primary-dark)]" />
            <span className="text-3xl font-bold">+{Math.round(totalReviews * 0.5)}</span>
            <span className="text-xs text-[var(--muted)] uppercase font-semibold">Est. Points</span>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[var(--border)] shadow-sm">
        <CardHeader>
          <CardTitle>Rating Breakdown</CardTitle>
          <CardDescription>How you rated your recall</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full h-8 rounded-full overflow-hidden mb-4">
            {ratingCounts.again > 0 && <div style={{ width: `${(ratingCounts.again/totalReviews)*100}%` }} className="bg-[var(--color-danger)]" title={`Again: ${ratingCounts.again}`} />}
            {ratingCounts.hard > 0 && <div style={{ width: `${(ratingCounts.hard/totalReviews)*100}%` }} className="bg-[var(--color-warning)]" title={`Hard: ${ratingCounts.hard}`} />}
            {ratingCounts.good > 0 && <div style={{ width: `${(ratingCounts.good/totalReviews)*100}%` }} className="bg-[var(--color-success-light)]" title={`Good: ${ratingCounts.good}`} />}
            {ratingCounts.easy > 0 && <div style={{ width: `${(ratingCounts.easy/totalReviews)*100}%` }} className="bg-[var(--color-success)]" title={`Easy: ${ratingCounts.easy}`} />}
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-[var(--color-danger)]">Again ({ratingCounts.again})</span>
            <span className="text-[var(--color-warning)]">Hard ({ratingCounts.hard})</span>
            <span className="text-[var(--color-success-light)]">Good ({ratingCounts.good})</span>
            <span className="text-[var(--color-success)]">Easy ({ratingCounts.easy})</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4 mt-4">
        <Link href="/dashboard">
          <Button variant="outline" size="lg">Home</Button>
        </Link>
        <Link href="/practice">
          <Button size="lg" className="gap-2">Practice Mode <ArrowRight className="w-4 h-4" /></Button>
        </Link>
      </div>
    </div>
  );
}
