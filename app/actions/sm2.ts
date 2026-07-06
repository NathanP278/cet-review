"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateSM2, CardState } from "@/lib/sm2";
import { Database } from "@/types/database";

type ReviewRating = "again" | "hard" | "good" | "easy";
type DbCardState = Database["public"]["Enums"]["card_state"];

export async function processReviewAction(userCardId: string, rating: ReviewRating, responseTimeSeconds: number = 0) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // 1. Fetch current card state
  const { data: card, error: fetchError } = await supabase
    .from("user_cards")
    .select("*")
    .eq("id", userCardId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !card) {
    throw new Error("Card not found");
  }

  // 2. Calculate next state using robust SM-2
  const currentState = card.state as CardState;
  const sm2Result = calculateSM2(
    rating,
    currentState,
    card.repetitions,
    card.interval,
    card.ease_factor,
    card.lapse_count
  );

  // 3. Calculate next review date (add interval in days)
  const nextReviewDate = new Date();
  if (sm2Result.interval > 0) {
    nextReviewDate.setDate(nextReviewDate.getDate() + sm2Result.interval);
  } else {
    // interval = 0 means learning/relearning (review again today, e.g. in 10 minutes)
    nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 10);
  }

  // Calculate new running average response time
  const newTotalReviews = card.total_reviews + 1;
  const newAverageResponseTime = 
    ((card.average_response_time * card.total_reviews) + responseTimeSeconds) / newTotalReviews;

  // Calculate a crude retention score (can be optimized later)
  const newRetentionScore = sm2Result.lapseCount === 0 ? 100 : Math.max(0, 100 - (sm2Result.lapseCount * 15));

  // 4. Update the card in Supabase
  const { error: updateError } = await supabase
    .from("user_cards")
    .update({
      interval: sm2Result.interval,
      repetitions: sm2Result.repetitions,
      ease_factor: sm2Result.easeFactor,
      next_review: nextReviewDate.toISOString(),
      updated_at: new Date().toISOString(),
      state: sm2Result.state as DbCardState,
      last_review: new Date().toISOString(),
      lapse_count: sm2Result.lapseCount,
      total_reviews: newTotalReviews,
      average_response_time: newAverageResponseTime,
      retention_score: newRetentionScore
    })
    .eq("id", userCardId)
    .eq("user_id", user.id);

  if (updateError) {
    throw new Error("Failed to update card");
  }

  // 5. Insert into Review History
  const { error: historyError } = await supabase
    .from("review_history")
    .insert({
      user_id: user.id,
      question_id: card.question_id,
      reviewed_at: new Date().toISOString(),
      rating,
      response_time_seconds: responseTimeSeconds,
      interval_days: sm2Result.interval,
      ease_factor: sm2Result.easeFactor
    });

  if (historyError) {
    console.error("Failed to log review history", historyError);
    // Non-blocking error
  }

  return { success: true, sm2Result, nextReviewDate };
}

/**
 * Generates the intelligent Daily Review Queue
 */
export async function getDailyReviewQueue(limit?: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Fetch user profile to get their specific daily_review_limit
  const { data: profile } = await supabase.from("profiles").select("daily_review_limit").eq("id", user.id).single();
  const reviewLimit = limit || profile?.daily_review_limit || 50;
  
  const now = new Date().toISOString();

  // 1. Overdue & Due Cards (highest priority)
  // We prioritize 'relearning' > 'learning' > 'review'
  // and prioritize cards with higher lapse_counts (leeches/frequently forgotten)
  let { data: cards, error } = await supabase
    .from("user_cards")
    .select(`
      id,
      state,
      next_review,
      interval,
      lapse_count,
      questions (
        id,
        content,
        answer,
        explanation,
        hint,
        difficulty,
        topic_id
      )
    `)
    .eq("user_id", user.id)
    .in("state", ["learning", "relearning", "review"])
    .lte("next_review", now)
    .order("lapse_count", { ascending: false }) // Prioritize forgotten
    .order("next_review", { ascending: true }) // Then by oldest due
    .limit(reviewLimit);

  if (error || !cards) {
    throw new Error("Failed to generate queue");
  }

  return cards;
}
