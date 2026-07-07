import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Trophy, Medal, Crown } from "lucide-react";
import { getLevelProgress } from "@/lib/progression";
import { Progress } from "@/components/ui/progress";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch top 100 users for the MVP
  const { data: topProfiles } = await supabase
    .from("profiles")
    .select("id, name, avatar_url, xp, level, active_title")
    .order("xp", { ascending: false })
    .limit(100);

  if (!topProfiles) return <div>Failed to load leaderboard.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl">
          <Trophy className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-display text-[var(--foreground)]">Global Leaderboard</h1>
          <p className="text-[var(--muted)] mt-1 text-lg">Compare your progress with other students.</p>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--border)] bg-[var(--color-slate-50)] dark:bg-[var(--color-slate-900)]/50 text-sm font-semibold text-[var(--muted)]">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-7">Student</div>
          <div className="col-span-2 text-right">Level</div>
          <div className="col-span-2 text-right">Total XP</div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {topProfiles.map((profile, index) => {
            const isCurrentUser = profile.id === user.id;
            const rank = index + 1;
            const progression = getLevelProgress(profile.xp || 0);

            let RankIcon = null;
            if (rank === 1) RankIcon = <Crown className="h-5 w-5 text-yellow-500 mx-auto" />;
            else if (rank === 2) RankIcon = <Medal className="h-5 w-5 text-slate-400 mx-auto" />;
            else if (rank === 3) RankIcon = <Medal className="h-5 w-5 text-amber-600 mx-auto" />;

            return (
              <div 
                key={profile.id} 
                className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors ${
                  isCurrentUser ? "bg-purple-50 dark:bg-purple-900/10" : "hover:bg-[var(--color-slate-50)] dark:hover:bg-[var(--color-slate-800)]/30"
                }`}
              >
                <div className="col-span-1 text-center font-bold text-[var(--muted)]">
                  {RankIcon || rank}
                </div>
                <div className="col-span-7 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold shadow-sm">
                    {profile.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-semibold ${isCurrentUser ? "text-purple-700 dark:text-purple-400" : "text-[var(--foreground)]"}`}>
                      {profile.name || "Anonymous Learner"} {isCurrentUser && "(You)"}
                    </span>
                    {profile.active_title && (
                      <span className="text-xs text-[var(--muted)]">{profile.active_title}</span>
                    )}
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-[var(--color-primary)]">Lvl {progression.level}</span>
                    <Progress value={progression.progressPct} className="h-1.5 w-16" />
                  </div>
                </div>
                <div className="col-span-2 text-right font-mono font-medium text-[var(--foreground)]">
                  {(profile.xp || 0).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
