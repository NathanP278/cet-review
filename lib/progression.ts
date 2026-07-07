/**
 * Progression & Gamification Engine
 * Handles XP curves, leveling, and rewards.
 */

export const LEVEL_CAP = 100;
export const BASE_XP = 100; // XP needed for Level 2
export const XP_MULTIPLIER = 1.15; // 15% increase per level

/**
 * Calculate the total XP required to reach a specific level.
 * Formula: BASE_XP * ( (XP_MULTIPLIER^(level-1) - 1) / (XP_MULTIPLIER - 1) )
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE_XP * ((Math.pow(XP_MULTIPLIER, level - 1) - 1) / (XP_MULTIPLIER - 1)));
}

/**
 * Calculate the current level based on total XP.
 */
export function getLevelFromXP(xp: number): number {
  let level = 1;
  while (level < LEVEL_CAP && xp >= getXPForLevel(level + 1)) {
    level++;
  }
  return level;
}

/**
 * Returns progression data for the UI
 */
export function getLevelProgress(xp: number) {
  const currentLevel = getLevelFromXP(xp);
  
  if (currentLevel >= LEVEL_CAP) {
    return {
      level: LEVEL_CAP,
      currentLevelXP: 0,
      nextLevelXP: 0,
      progressPct: 100
    };
  }

  const currentLevelStartXP = getXPForLevel(currentLevel);
  const nextLevelStartXP = getXPForLevel(currentLevel + 1);
  
  const xpIntoLevel = xp - currentLevelStartXP;
  const xpRequiredForNext = nextLevelStartXP - currentLevelStartXP;
  const progressPct = Math.min(100, Math.max(0, (xpIntoLevel / xpRequiredForNext) * 100));

  return {
    level: currentLevel,
    currentLevelXP: xpIntoLevel,
    nextLevelXP: xpRequiredForNext,
    progressPct
  };
}

export type ActionType = 'quiz_completed' | 'flashcard_review' | 'exam_completed' | 'streak_maintained';

export const XP_REWARDS: Record<ActionType, number> = {
  'flashcard_review': 5, // 5 XP per flashcard
  'quiz_completed': 50,  // 50 XP per quiz
  'exam_completed': 250, // 250 XP per mock exam
  'streak_maintained': 100, // 100 XP daily bonus
};
