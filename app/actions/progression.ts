"use server";

import { createClient } from "@/lib/supabase/server";
import { getLevelFromXP, ActionType, XP_REWARDS } from "@/lib/progression";

export async function awardXP(action: ActionType, multiplier: number = 1, metadata: any = {}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const baseXP = XP_REWARDS[action] || 0;
  const awardedXP = Math.round(baseXP * multiplier);

  if (awardedXP <= 0) return null;

  // 1. Get current profile to safely increment
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, level")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  const newTotalXP = (profile.xp || 0) + awardedXP;
  const newLevel = getLevelFromXP(newTotalXP);
  const leveledUp = newLevel > (profile.level || 1);

  // 2. Update Profile
  await supabase
    .from("profiles")
    .update({ xp: newTotalXP, level: newLevel })
    .eq("id", user.id);

  // 3. Log XP History
  await supabase
    .from("user_xp_history")
    .insert({
      user_id: user.id,
      action_type: action,
      xp_awarded: awardedXP,
      metadata
    });

  // 4. Update Mission Progress
  await updateMissionProgress(user.id, action);

  return { awardedXP, newTotalXP, newLevel, leveledUp };
}

export async function ensureDailyMissions(userId: string) {
  const supabase = await createClient();
  const now = new Date();
  
  // Clean expired missions
  await supabase
    .from("user_missions")
    .delete()
    .eq("user_id", userId)
    .lt("expires_at", now.toISOString());

  // Check current missions
  const { data: activeMissions } = await supabase
    .from("user_missions")
    .select("id")
    .eq("user_id", userId);

  if (!activeMissions || activeMissions.length < 3) {
    // Need to assign new missions
    const { data: availableMissions } = await supabase
      .from("missions")
      .select("id")
      .eq("mission_type", "daily");

    if (availableMissions && availableMissions.length > 0) {
      // Pick random missions
      const shuffled = availableMissions.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3 - (activeMissions?.length || 0));
      
      const tomorrow = new Date();
      tomorrow.setHours(23, 59, 59, 999); // End of today

      const newMissions = selected.map(m => ({
        user_id: userId,
        mission_id: m.id,
        current_progress: 0,
        is_completed: false,
        expires_at: tomorrow.toISOString()
      }));

      if (newMissions.length > 0) {
        await supabase.from("user_missions").insert(newMissions);
      }
    }
  }
}

async function updateMissionProgress(userId: string, action: ActionType) {
  const supabase = await createClient();
  
  // Find active missions matching this action
  const { data: userMissions } = await supabase
    .from("user_missions")
    .select("id, current_progress, mission_id, missions!inner(action_type, target_count, xp_reward)")
    .eq("user_id", userId)
    .eq("is_completed", false);

  if (!userMissions) return;

  for (const um of userMissions) {
    const mission = um.missions as any;
    if (mission.action_type === action) {
      const newProgress = um.current_progress + 1;
      const isCompleted = newProgress >= mission.target_count;

      await supabase
        .from("user_missions")
        .update({ current_progress: newProgress, is_completed: isCompleted })
        .eq("id", um.id);

      if (isCompleted) {
        // Automatically award XP for mission completion!
        // Using a direct update to avoid infinite loops with awardXP
        const { data: profile } = await supabase.from("profiles").select("xp").eq("id", userId).single();
        if (profile) {
          await supabase.from("profiles").update({ xp: (profile.xp || 0) + mission.xp_reward }).eq("id", userId);
        }
      }
    }
  }
}
