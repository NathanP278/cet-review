import { createClient } from "@/lib/supabase/server";
import { ReadinessMetrics } from "./readiness";

export interface StudyInsight {
  id: string;
  type: "strength" | "weakness" | "trend" | "suggestion";
  message: string;
}

export async function generateStudyInsights(userId: string, readiness: ReadinessMetrics): Promise<StudyInsight[]> {
  const supabase = await createClient();
  const insights: StudyInsight[] = [];

  // 1. Analyze Subject Strengths/Weaknesses from Readiness
  const subjects = Object.entries(readiness.subjectReadiness);
  if (subjects.length > 0) {
    subjects.sort((a, b) => b[1] - a[1]);
    
    const strongest = subjects[0];
    const weakest = subjects[subjects.length - 1];

    if (strongest[1] > 80) {
      insights.push({
        id: "insight_strongest_subject",
        type: "strength",
        message: `You consistently perform well in ${strongest[0]}. Keep it up!`
      });
    }

    if (weakest[1] < 60) {
      insights.push({
        id: "insight_weakest_subject",
        type: "weakness",
        message: `Your weakest area is ${weakest[0]}. Consider dedicating your next study session to it.`
      });
    }
  }

  // 2. Analyze recent review drops (Forgetting trend)
  const { data: recentReviews } = await supabase
    .from("review_history")
    .select("rating, created_at:reviewed_at")
    .eq("user_id", userId)
    .order("reviewed_at", { ascending: false })
    .limit(50);

  if (recentReviews && recentReviews.length > 20) {
    const recentLapses = recentReviews.slice(0, 10).filter(r => r.rating === "again" || r.rating === "hard").length;
    const oldLapses = recentReviews.slice(10, 20).filter(r => r.rating === "again" || r.rating === "hard").length;

    if (recentLapses > oldLapses + 2) {
      insights.push({
        id: "insight_retention_drop",
        type: "trend",
        message: "Your retention has dropped recently. Try doing a few short, focused review sessions to solidify your memory."
      });
    } else if (recentLapses < oldLapses && readiness.overallScore > 0) {
      insights.push({
        id: "insight_retention_improve",
        type: "trend",
        message: "You are improving steadily! Your recent reviews show higher accuracy."
      });
    }
  }

  // 3. Time-based insights
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak")
    .eq("id", userId)
    .single();

  if (profile?.streak && profile.streak > 3) {
    insights.push({
      id: "insight_streak",
      type: "strength",
      message: `You're on a ${profile.streak}-day study streak! Completing today's reviews is predicted to further improve your readiness.`
    });
  } else if (!profile?.streak || profile.streak === 0) {
    insights.push({
      id: "insight_consistency",
      type: "suggestion",
      message: "Study consistency is key to CET preparation. Try to complete at least 10 reviews a day."
    });
  }

  // Fallback insight
  if (insights.length === 0) {
    insights.push({
      id: "insight_default",
      type: "suggestion",
      message: "Keep completing your daily reviews and taking mock exams to generate personalized study insights!"
    });
  }

  return insights;
}
