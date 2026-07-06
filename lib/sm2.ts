export interface SM2Result {
  interval: number;
  repetitions: number;
  easeFactor: number;
}

/**
 * Calculates the next review interval using the SM-2 Spaced Repetition Algorithm.
 *
 * @param quality - Quality of response (0-5)
 *  5: perfect response
 *  4: correct response after a hesitation
 *  3: correct response recalled with serious difficulty
 *  2: incorrect response; where the correct one seemed easy to recall
 *  1: incorrect response; the correct one remembered
 *  0: complete blackout
 * @param repetitions - Previous number of consecutive correct repetitions
 * @param previousInterval - Previous interval in days
 * @param previousEaseFactor - Previous ease factor (defaults to 2.5)
 * @returns SM2Result containing the new interval, repetitions, and ease factor
 */
export function calculateSM2(
  quality: number,
  repetitions: number,
  previousInterval: number,
  previousEaseFactor: number
): SM2Result {
  // Ensure quality is between 0 and 5
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  let newRepetitions = repetitions;
  let newInterval = previousInterval;
  let newEaseFactor = previousEaseFactor;

  // 1. Calculate new ease factor
  newEaseFactor = previousEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  // 2. Calculate repetitions and interval based on correct/incorrect
  if (q >= 3) {
    // Correct response
    if (newRepetitions === 0) {
      newInterval = 1;
    } else if (newRepetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(previousInterval * newEaseFactor);
    }
    newRepetitions += 1;
  } else {
    // Incorrect response
    newRepetitions = 0;
    newInterval = 1;
  }

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: Number(newEaseFactor.toFixed(3)),
  };
}
