import { createClient } from "@/lib/supabase/server";

export async function updateUserStreak(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak, settings")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const now = new Date();
  
  // Use local timezone shift to handle late night studying
  // Get YYYY-MM-DD for today in local time
  // For a robust server implementation, ideally we'd know the user's timezone from settings
  // As a fallback, we use UTC offset logic, or just standard YYYY-MM-DD
  const todayStr = now.toISOString().split("T")[0];

  const settings = (profile.settings as Record<string, any>) || {};
  const lastStudyDate = settings.last_study_date as string | undefined;

  let newStreak = profile.streak || 0;
  let updated = false;

  if (!lastStudyDate) {
    // First time studying
    newStreak = 1;
    updated = true;
  } else if (lastStudyDate === todayStr) {
    // Already studied today
    return;
  } else {
    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastStudyDate === yesterdayStr) {
      // Streak continues!
      newStreak += 1;
    } else {
      // Streak broken
      newStreak = 1;
    }
    updated = true;
  }

  if (updated) {
    settings.last_study_date = todayStr;
    await supabase
      .from("profiles")
      .update({
        streak: newStreak,
        settings
      })
      .eq("id", userId);
  }
}
