import { describe, it, expect } from 'vitest';
import { calculateSM2 } from './sm2';

describe('SM-2 Algorithm', () => {
  it('should set interval to 1 on the first successful repetition (n=0)', () => {
    const result = calculateSM2(4, 0, 0, 2.5);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);
    // EF should not change much for quality 4
    expect(result.easeFactor).toBeCloseTo(2.5, 1);
  });

  it('should set interval to 6 on the second successful repetition (n=1)', () => {
    const result = calculateSM2(4, 1, 1, 2.5);
    expect(result.interval).toBe(6);
    expect(result.repetitions).toBe(2);
  });

  it('should multiply interval by EF for subsequent successful repetitions (n>1)', () => {
    const prevEF = 2.5;
    const prevInterval = 6;
    const result = calculateSM2(4, 2, prevInterval, prevEF);
    // EF stays roughly 2.5 for quality 4. Expected interval: Math.round(6 * 2.5) = 15
    expect(result.interval).toBe(15);
    expect(result.repetitions).toBe(3);
  });

  it('should reset repetitions and interval to 1 on failure (quality < 3)', () => {
    // Quality 2 is a failure
    const result = calculateSM2(2, 5, 20, 2.5);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(0);
    // EF should decrease for quality 2
    expect(result.easeFactor).toBeLessThan(2.5);
  });

  it('should never let easeFactor drop below 1.3', () => {
    // Simulate many complete blackouts
    let currentEF = 1.35;
    const result = calculateSM2(0, 0, 1, currentEF);
    expect(result.easeFactor).toBe(1.3); // Cannot drop below 1.3
  });

  it('should increase easeFactor on a perfect response (quality = 5)', () => {
    const result = calculateSM2(5, 2, 6, 2.5);
    // EF = 2.5 + (0.1 - (0)*(...)) = 2.6
    expect(result.easeFactor).toBe(2.6);
  });
});
