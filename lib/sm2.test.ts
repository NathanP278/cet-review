import { describe, it, expect } from "vitest";
import { calculateSM2 } from "./sm2";

describe("Intelligent SM-2 Algorithm", () => {
  it("should graduate a new card to review on 'good'", () => {
    const result = calculateSM2("good", "new", 0, 0, 2.5, 0);
    expect(result.state).toBe("review");
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);
  });

  it("should keep a learning card in learning on 'hard'", () => {
    const result = calculateSM2("hard", "learning", 0, 0, 2.5, 0);
    expect(result.state).toBe("learning");
    expect(result.interval).toBe(0);
  });

  it("should penalize a mature review card on 'again' without resetting completely", () => {
    const result = calculateSM2("again", "review", 5, 20, 2.5, 0);
    expect(result.state).toBe("relearning");
    expect(result.interval).toBe(4); // 20 * 0.2
    expect(result.lapseCount).toBe(1);
    expect(result.easeFactor).toBeLessThan(2.5);
  });

  it("should multiply interval by EF for 'good' on a mature card", () => {
    const result = calculateSM2("good", "review", 2, 6, 2.5, 0);
    expect(result.interval).toBe(15); // 6 * 2.5
    expect(result.state).toBe("review");
    expect(result.lapseCount).toBe(0);
  });

  it("should apply easy bonus for 'easy' on a mature card", () => {
    const result = calculateSM2("easy", "review", 2, 6, 2.5, 0);
    expect(result.interval).toBe(20); // 6 * 2.5 * 1.3 = 19.5 -> 20
    expect(result.state).toBe("review");
  });
});
