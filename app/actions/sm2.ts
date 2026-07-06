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
export async function getDailyReviewQueue(limit?: number, offset: number = 0) {
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
  const fetchLimit = reviewLimit * 2; // Fetch 2x to shuffle

  // 1. Overdue & Due Cards (highest priority)
  // We prioritize 'relearning' > 'learning' > 'review'
  // and prioritize cards with higher lapse_counts (leeches/frequently forgotten)
  // Fetch a larger pool to interleave
  const { data: cards, error } = await supabase
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
    .range(offset, offset + fetchLimit - 1);

  if (error || !cards) {
    throw new Error("Failed to generate queue");
  }

  // Smart Review Order: Interleaving
  // Group cards by topic_id (or subject_id)
  const groupedCards = new Map<string, Record<string, unknown>[]>();
  
  cards.forEach(card => {
    const q = Array.isArray(card.questions) ? card.questions[0] : card.questions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = q && Array.isArray((q as any).topics) ? (q as any).topics[0] : (q as any).topics;
    const topicId = t ? t.id : "general";

    if (!groupedCards.has(topicId)) {
      groupedCards.set(topicId, []);
    }
    groupedCards.get(topicId)!.push(card);
  });

  const interleavedQueue: Record<string, unknown>[] = [];
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

/**
 * Processes a batch of SM-2 updates efficiently.
 * Used at the end of a quiz attempt to minimize Supabase roundtrips.
 */
export async function processBatchSM2Updates(
  updates: Array<{ questionId: string; quality: number; responseTimeSeconds: number }>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (updates.length === 0) return { success: true };

  // Fetch all existing cards for these questions
  const questionIds = updates.map((u) => u.questionId);
  const { data: existingCards } = await supabase
    .from("user_cards")
    .select("*")
    .in("question_id", questionIds)
    .eq("user_id", user.id);

  const cardsToUpsert: any[] = [];
  const historyToInsert: any[] = [];
  const now = new Date().toISOString();

  for (const update of updates) {
    const card = existingCards?.find((c) => c.question_id === update.questionId);
    
    // Default values for new cards
    let currentState: CardState = "new";
    let repetitions = 0;
    let interval = 0;
    let easeFactor = 2.5;
    let lapseCount = 0;
    let totalReviews = 0;
    let averageResponseTime = 0;

    if (card) {
      currentState = card.state as CardState;
      repetitions = card.repetitions;
      interval = card.interval;
      easeFactor = card.ease_factor;
      lapseCount = card.lapse_count;
      totalReviews = card.total_reviews;
      averageResponseTime = card.average_response_time;
    }

    // Map quality 1-4 to rating
    let rating: ReviewRating = "good";
    if (update.quality <= 1) rating = "again";
    else if (update.quality === 2) rating = "hard";
    else if (update.quality === 3) rating = "good";
    else if (update.quality >= 4) rating = "easy";

    const sm2Result = calculateSM2(
      rating,
      currentState,
      repetitions,
      interval,
      easeFactor,
      lapseCount
    );

    const nextReviewDate = new Date();
    if (sm2Result.interval > 0) {
      nextReviewDate.setDate(nextReviewDate.getDate() + sm2Result.interval);
    } else {
      nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 10);
    }

    const newTotalReviews = totalReviews + 1;
    const newAverageResponseTime =
      (averageResponseTime * totalReviews + update.responseTimeSeconds) / newTotalReviews;

    const newRetentionScore = sm2Result.lapseCount === 0 ? 100 : Math.max(0, 100 - sm2Result.lapseCount * 15);

    const upsertPayload = {
      ...(card ? { id: card.id } : {}), // include ID if updating
      user_id: user.id,
      question_id: update.questionId,
      interval: sm2Result.interval,
      repetitions: sm2Result.repetitions,
      ease_factor: sm2Result.easeFactor,
      next_review: nextReviewDate.toISOString(),
      updated_at: now,
      state: sm2Result.state as DbCardState,
      last_review: now,
      lapse_count: sm2Result.lapseCount,
      total_reviews: newTotalReviews,
      average_response_time: newAverageResponseTime,
      retention_score: newRetentionScore,
    };
    
    cardsToUpsert.push(upsertPayload);

    historyToInsert.push({
      user_id: user.id,
      question_id: update.questionId,
      reviewed_at: now,
      rating,
      response_time_seconds: update.responseTimeSeconds,
      interval_days: sm2Result.interval,
      ease_factor: sm2Result.easeFactor,
    });
  }

  // Perform bulk upsert
  const { error: upsertError } = await supabase.from("user_cards").upsert(cardsToUpsert, {
    onConflict: "user_id, question_id",
  });

  if (upsertError) {
    console.error("Bulk upsert cards failed:", upsertError);
    throw new Error("Failed to process SM2 batch");
  }

  // Perform bulk insert
  const { error: historyError } = await supabase.from("review_history").insert(historyToInsert);

  if (historyError) {
    console.error("Bulk insert history failed:", historyError);
  }

  return { success: true };
}
