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
  // Fetch a larger pool to interleave
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
        question_text,
        correct_answer,
        explanation,
        difficulty,
        topics (
          id,
          name,
          subjects (
            id,
            name
          )
        )
      )
    `)
    .eq("user_id", user.id)
    .in("state", ["learning", "relearning", "review"])
    .lte("next_review", now)
    .order("lapse_count", { ascending: false }) // Prioritize forgotten
    .order("next_review", { ascending: true }) // Then by oldest due
    .limit(reviewLimit * 2); // Fetch 2x to shuffle

  if (error || !cards) {
    throw new Error("Failed to generate queue");
  }

  // Smart Review Order: Interleaving
  // Group cards by topic_id (or subject_id)
  const groupedCards = new Map<string, any[]>();
  
  cards.forEach(card => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = Array.isArray(card.questions) ? card.questions[0] : card.questions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = q && Array.isArray((q as any).topics) ? (q as any).topics[0] : (q as any).topics;
    const topicId = t ? t.id : "general";

    if (!groupedCards.has(topicId)) {
      groupedCards.set(topicId, []);
    }
    groupedCards.get(topicId)!.push(card);
  });

  const interleavedQueue: any[] = [];
  const keys = Array.from(groupedCards.keys());
  
  // Round robin extraction
  let added = true;
  while (added && interleavedQueue.length < reviewLimit) {
    added = false;
    for (const key of keys) {
      if (interleavedQueue.length >= reviewLimit) break;
      const group = groupedCards.get(key);
      if (group && group.length > 0) {
        interleavedQueue.push(group.shift());
        added = true;
      }
    }
  }

  return interleavedQueue;
}
