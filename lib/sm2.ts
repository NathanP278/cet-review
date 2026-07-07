export type CardState = "new" | "learning" | "review" | "relearning" | "suspended" | "buried";

export interface SM2Result {
  interval: number;
  repetitions: number;
  easeFactor: number;
  state: CardState;
  lapseCount: number;
}

/**
 * Calculates the next review interval using a robust Anki-style SM-2 Algorithm.
 */
export function calculateSM2(
  rating: "again" | "hard" | "good" | "easy",
  currentState: CardState,
  repetitions: number,
  previousInterval: number,
  previousEaseFactor: number,
  lapseCount: number
): SM2Result {
  let nextState = currentState;
  let newRepetitions = repetitions;
  let newInterval = previousInterval;
  let newEaseFactor = previousEaseFactor;
  let newLapseCount = lapseCount;

  // Standard SM-2 Quality mapping
  // 1 = Blackout (Again)
  // 3 = Correct but hard (Hard)
  // 4 = Correct with hesitation (Good)
  // 5 = Perfect recall (Easy)
  const quality = rating === "again" ? 1 : rating === "hard" ? 3 : rating === "good" ? 4 : 5;

  if (rating === "again") {
    newRepetitions = 0;
    if (currentState === "review") {
      // Lapsed card
      newLapseCount += 1;
      nextState = "relearning";
      newInterval = Math.max(1, Math.round(previousInterval * 0.2)); // 20% penalty
    } else {
      nextState = "learning";
      newInterval = 0; // Same day review
    }
  } else {
    // Correct response
    if (currentState === "new" || currentState === "learning" || currentState === "relearning") {
      // Graduate to review
      nextState = "review";
      if (rating === "easy") {
        newInterval = 4;
      } else if (rating === "good") {
        newInterval = 1;
      } else {
        // hard
        newInterval = 0; 
        nextState = currentState; // don't graduate yet
      }
      newRepetitions = 1;
    } else {
      // Already in review state
      if (newRepetitions === 0) {
        newInterval = 1;
      } else if (newRepetitions === 1) {
        newInterval = 6;
      } else {
        const hardFactor = 1.2;
        const easyBonus = 1.3;
        
        if (rating === "hard") {
           newInterval = Math.round(previousInterval * hardFactor);
        } else if (rating === "good") {
           newInterval = Math.round(previousInterval * previousEaseFactor);
        } else if (rating === "easy") {
           newInterval = Math.round(previousInterval * previousEaseFactor * easyBonus);
        }
      }
      newRepetitions += 1;
    }
  }

  // Adjust Ease Factor (EF)
  newEaseFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: Number(newEaseFactor.toFixed(3)),
    state: nextState,
    lapseCount: newLapseCount
  };
}

/**
 * Helper to calculate exactly what the next interval will be for each of the 4 buttons,
 * so the UI can display them to the user.
 */
export function calculateIntervalProjections(
  currentState: CardState,
  repetitions: number,
  previousInterval: number,
  previousEaseFactor: number,
  lapseCount: number
) {
  const ratings = ["again", "hard", "good", "easy"] as const;
  const projections: Record<string, number> = {};

  ratings.forEach(rating => {
    const res = calculateSM2(rating, currentState, repetitions, previousInterval, previousEaseFactor, lapseCount);
    projections[rating] = res.interval;
  });

  return projections;
}
