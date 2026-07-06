"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateSM2 } from "@/lib/sm2";

export async function processReviewAction(
  userCardId: string,
  quality: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  // 2. Calculate next state using SM-2
  const sm2Result = calculateSM2(
    quality,
    card.repetitions,
    card.interval,
    card.ease_factor
  );

  // 3. Calculate next review date (add interval in days)
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + sm2Result.interval);

  // 4. Update the card in Supabase
  const { error: updateError } = await supabase
    .from("user_cards")
    .update({
      interval: sm2Result.interval,
      repetitions: sm2Result.repetitions,
      ease_factor: sm2Result.easeFactor,
      next_review: nextReviewDate.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userCardId)
    .eq("user_id", user.id);

  if (updateError) {
    throw new Error("Failed to update card");
  }

  return { success: true, sm2Result, nextReviewDate };
}
