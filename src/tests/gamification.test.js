import { describe, it, expect } from 'vitest';
import { calculateLevel, getProgressToNextLevel } from '../constants/gamification';

describe('Gamification Functions', () => {
  describe('calculateLevel', () => {
    it('returns Beginner for 0 XP', () => {
      const level = calculateLevel(0);
      expect(level.level).toBe(1);
      expect(level.label).toBe('Beginner');
    });

    it('returns Apprentice for 500+ XP', () => {
      const level = calculateLevel(500);
      expect(level.level).toBe(2);
      expect(level.label).toBe('Apprentice');
    });

    it('returns Operator for 1500+ XP', () => {
      const level = calculateLevel(1500);
      expect(level.level).toBe(3);
      expect(level.label).toBe('Operator');
    });

    it('returns Specialist for 4000+ XP', () => {
      const level = calculateLevel(4000);
      expect(level.level).toBe(4);
      expect(level.label).toBe('Specialist');
    });

    it('returns Expert for 10000+ XP', () => {
      const level = calculateLevel(10000);
      expect(level.level).toBe(5);
      expect(level.label).toBe('Expert');
    });

    it('returns Genie Prime for 1000000+ XP', () => {
      const level = calculateLevel(1000000);
      expect(level.level).toBe(10);
      expect(level.label).toBe('Genie Prime');
    });

    it('returns correct bonus multipliers', () => {
      expect(calculateLevel(500).bonus).toBe(1.05);
      expect(calculateLevel(10000).bonus).toBe(1.50);
      expect(calculateLevel(150000).bonus).toBe(2.50);
    });
  });

  describe('getProgressToNextLevel', () => {
    it('returns 0% for 0 XP (at level 1 start)', () => {
      const progress = getProgressToNextLevel(0);
      expect(progress).toBe(0);
    });

    it('returns 100% when reaching next level threshold', () => {
      const progress = getProgressToNextLevel(500);
      expect(progress).toBe(100);
    });

    it('returns ~50% at halfway point', () => {
      const midpoint = (500 + 1500) / 2;
      const progress = getProgressToNextLevel(midpoint);
      expect(progress).toBeGreaterThan(40);
      expect(progress).toBeLessThan(60);
    });

    it('returns 100% at max level (Genie Prime)', () => {
      const progress = getProgressToNextLevel(1000000);
      expect(progress).toBe(100);
    });

    it('clamps progress between 0 and 100', () => {
      const progressNegative = getProgressToNextLevel(-100);
      const progressMax = getProgressToNextLevel(9999999);
      expect(progressNegative).toBeGreaterThanOrEqual(0);
      expect(progressMax).toBeLessThanOrEqual(100);
    });
  });
});
