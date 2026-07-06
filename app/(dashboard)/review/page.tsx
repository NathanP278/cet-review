import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlayCircle, Clock, CalendarDays, BarChart3, AlertCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReviewHeatmap } from "@/components/domain/ReviewHeatmap";

export const dynamic = "force-dynamic";

export default async function ReviewDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all cards for categorization
  const { data: allCards } = await supabase
    .from("user_cards")
    .select("state, next_review, average_response_time")
    .eq("user_id", user.id);

  let overdue = 0;
  let dueToday = 0;
  let learning = 0;
  let relearning = 0;
  let totalEstimatedTimeSeconds = 0;

  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  if (allCards) {
    allCards.forEach(card => {
      const nextReview = new Date(card.next_review);
      
      if (nextReview < now) {
        overdue++;
        totalEstimatedTimeSeconds += (card.average_response_time > 0 ? card.average_response_time : 15);
      } else if (nextReview <= todayEnd) {
        dueToday++;
        totalEstimatedTimeSeconds += (card.average_response_time > 0 ? card.average_response_time : 15);
      }

      if (card.state === "learning") learning++;
      if (card.state === "relearning") relearning++;
    });
  }

  const totalDue = overdue + dueToday;
  const estimatedTimeMins = Math.ceil(totalEstimatedTimeSeconds / 60);

  // Fetch Profile settings
  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_review_limit, streak")
    .eq("id", user.id)
    .single();

  const dailyLimit = profile?.daily_review_limit || 50;
  
  // Fetch today's completed reviews
  const { count: completedToday } = await supabase
    .from("review_history")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("reviewed_at", new Date(new Date().setHours(0,0,0,0)).toISOString());

  const completed = completedToday || 0;

  // Fetch heatmap data (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const { data: historyData } = await supabase
    .from("review_history")
    .select("reviewed_at")
    .eq("user_id", user.id)
    .gte("reviewed_at", ninetyDaysAgo.toISOString());

  // Aggregate into map
  const heatmapCounts = new Map<string, number>();
  if (historyData) {
    historyData.forEach(r => {
      const date = new Date(r.reviewed_at).toISOString().split('T')[0];
      heatmapCounts.set(date, (heatmapCounts.get(date) || 0) + 1);
    });
  }

  const heatmapArray = Array.from(heatmapCounts.entries()).map(([date, count]) => ({
    date,
    count
  }));

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-display text-[var(--foreground)] mb-2">
            Review Session
          </h1>
          <p className="text-[var(--muted)] text-lg">Your daily spaced repetition queue.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/review/session">
            <Button size="lg" className="gap-2 text-lg shadow-md px-8 py-6 h-auto">
              <PlayCircle className="h-6 w-6" />
              {completed > 0 && totalDue > 0 ? "Continue Review" : totalDue > 0 ? "Start Review" : "Study Ahead"}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1 border-[var(--border)] shadow-sm">
          <CardHeader className="bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)]/30 rounded-t-xl pb-4 border-b border-[var(--border)]">
            <CardTitle className="text-xl">Today&apos;s Review Plan</CardTitle>
            <CardDescription>
              {completed} / {dailyLimit} cards completed
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
             <div className="h-3 w-full bg-[var(--color-slate-200)] dark:bg-[var(--color-slate-800)] rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-[var(--color-primary)] transition-all duration-1000 ease-out relative"
                style={{ width: `${Math.min(100, (completed / dailyLimit) * 100)}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-xl bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)]/50 border border-[var(--border)]">
                <span className="block text-3xl font-bold text-[var(--foreground)] mb-1">{totalDue}</span>
                <span className="text-sm text-[var(--muted)] uppercase tracking-wider font-semibold">Cards Due</span>
              </div>
              <div className="p-4 rounded-xl bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)]/50 border border-[var(--border)]">
                <span className="block text-3xl font-bold text-[var(--foreground)] mb-1">{estimatedTimeMins}m</span>
                <span className="text-sm text-[var(--muted)] uppercase tracking-wider font-semibold">Est. Time</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-[var(--border)] shadow-sm">
           <CardHeader className="bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)]/30 rounded-t-xl pb-4 border-b border-[var(--border)]">
            <CardTitle className="text-xl">Queue Breakdown</CardTitle>
            <CardDescription>What&apos;s inside your review stack</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col justify-center h-full gap-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-danger)]" />
                  <span className="font-medium text-[var(--foreground)]">Overdue</span>
                </div>
                <span className="font-bold">{overdue}</span>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-warning)]" />
                  <span className="font-medium text-[var(--foreground)]">Relearning</span>
                </div>
                <span className="font-bold">{relearning}</span>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-success)]" />
                  <span className="font-medium text-[var(--foreground)]">Learning</span>
                </div>
                <span className="font-bold">{learning}</span>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/analytics" className="col-span-1">
          <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center py-6 gap-3 group border-2">
            <BarChart3 className="w-8 h-8 text-[var(--muted)] group-hover:text-[var(--color-primary)] transition-colors" />
            <span className="font-semibold text-lg">Statistics</span>
          </Button>
        </Link>
        <Link href="/calendar" className="col-span-1">
           <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center py-6 gap-3 group border-2">
            <CalendarDays className="w-8 h-8 text-[var(--muted)] group-hover:text-[var(--color-primary)] transition-colors" />
            <span className="font-semibold text-lg">Review Calendar</span>
          </Button>
        </Link>
        <Link href="/history" className="col-span-1">
           <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center py-6 gap-3 group border-2">
            <Clock className="w-8 h-8 text-[var(--muted)] group-hover:text-[var(--color-primary)] transition-colors" />
            <span className="font-semibold text-lg">Review History</span>
          </Button>
        </Link>
      </div>

      <Card className="border-[var(--border)] shadow-sm">
        <CardHeader>
           <CardTitle className="text-xl">Contribution Heatmap</CardTitle>
           <CardDescription>Your daily review activity</CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewHeatmap data={heatmapArray} days={90} />
        </CardContent>
      </Card>
    </div>
  );
}
