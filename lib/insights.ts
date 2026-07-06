// lib/insights.ts

export interface StudyInsight {
  id: string;
  type: "positive" | "warning" | "neutral";
  message: string;
}

export function generateInsights(
  reviewHistory: any[],
  userCards: any[],
  subjects: any[]
): StudyInsight[] {
  const insights: StudyInsight[] = [];

  if (!reviewHistory || reviewHistory.length === 0) {
    return [
      {
        id: "no_data",
        type: "neutral",
        message: "Complete more review sessions to unlock personalized study insights.",
      },
    ];
  }

  // 1. Time of day analysis
  let morningCorrect = 0;
  let morningTotal = 0;
  let eveningCorrect = 0;
  let eveningTotal = 0;

  reviewHistory.forEach((r) => {
    const hour = new Date(r.reviewed_at).getHours();
    const isCorrect = r.rating === "good" || r.rating === "easy";
    if (hour >= 5 && hour < 12) {
      morningTotal++;
      if (isCorrect) morningCorrect++;
    } else if (hour >= 17 || hour < 4) {
      eveningTotal++;
      if (isCorrect) eveningCorrect++;
    }
  });

  const morningAcc = morningTotal > 5 ? morningCorrect / morningTotal : 0;
  const eveningAcc = eveningTotal > 5 ? eveningCorrect / eveningTotal : 0;

  if (morningAcc > eveningAcc + 0.1 && morningAcc > 0.7) {
    insights.push({
      id: "time_morning",
      type: "positive",
      message: "You remember concepts better during morning review sessions.",
    });
  } else if (eveningAcc > morningAcc + 0.1 && eveningAcc > 0.7) {
    insights.push({
      id: "time_evening",
      type: "positive",
      message: "Your retention peaks during evening and late-night study sessions.",
    });
  }

  // 2. Fastest Subject
  // We need the relation from review -> question -> topic -> category -> subject
  // For simplicity since we don't have deeply joined data in this pure function,
  // we'll pass an aggregated map or calculate based on time_spent_secs
  let totalTime = 0;
  reviewHistory.forEach(r => totalTime += (r.time_spent_secs || 0));
  const avgTime = totalTime / reviewHistory.length;
  
  if (avgTime < 5 && reviewHistory.length > 20) {
     insights.push({
      id: "fast_response",
      type: "positive",
      message: `You are answering questions extremely fast (avg ${avgTime.toFixed(1)}s). Make sure you are reading carefully.`,
    });
  }

  // 3. Learning Momentum
  // Calculate average retention from user_cards
  let totalRetention = 0;
  userCards.forEach(c => totalRetention += (c.retention_score || 0));
  const avgRetention = userCards.length > 0 ? totalRetention / userCards.length : 0;

  if (avgRetention > 0.85) {
     insights.push({
      id: "high_retention",
      type: "positive",
      message: "Excellent! Your overall retention rate is extremely high.",
    });
  } else if (avgRetention < 0.6 && userCards.length > 20) {
     insights.push({
      id: "low_retention",
      type: "warning",
      message: "Your retention is dipping. Try doing more frequent, shorter review sessions.",
    });
  }

  // Ensure we return at least one generic positive insight if none match
  if (insights.length === 0) {
    insights.push({
      id: "consistent",
      type: "positive",
      message: "Your study habits are stable. Keep up the consistent daily reviews!",
    });
  }

  return insights.slice(0, 3); // Max 3 insights
}

export function calculateMomentum(reviewHistory: any[]): "Improving" | "Stable" | "Declining" | "Needs Attention" {
  if (!reviewHistory || reviewHistory.length < 10) return "Stable";

  // Compare last 7 days vs previous 7 days accuracy
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  let recentTotal = 0, recentCorrect = 0;
  let olderTotal = 0, olderCorrect = 0;

  reviewHistory.forEach(r => {
    const d = new Date(r.reviewed_at);
    const isCorrect = r.rating === "good" || r.rating === "easy";
    if (d >= sevenDaysAgo) {
      recentTotal++;
      if (isCorrect) recentCorrect++;
    } else if (d >= fourteenDaysAgo && d < sevenDaysAgo) {
      olderTotal++;
      if (isCorrect) olderCorrect++;
    }
  });

  if (recentTotal === 0 && olderTotal > 0) return "Declining";
  if (olderTotal === 0) return "Improving";

  const recentAcc = recentTotal > 0 ? recentCorrect / recentTotal : 0;
  const olderAcc = olderTotal > 0 ? olderCorrect / olderTotal : 0;

  if (recentAcc > olderAcc + 0.1) return "Improving";
  if (recentAcc < olderAcc - 0.15) return "Needs Attention";
  if (recentAcc < olderAcc - 0.05) return "Declining";
  return "Stable";
}
