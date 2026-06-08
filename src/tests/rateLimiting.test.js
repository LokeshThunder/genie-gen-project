import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  checkRateLimit, 
  withRateLimit, 
  resetRateLimit, 
  getRateLimitStatus 
} from '../utils/rateLimitingService';

describe('Rate Limiting Service', () => {
  beforeEach(() => {
    // Reset all rate limits before each test
    vi.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('allows first call within limit', () => {
      const result = checkRateLimit('testOp', 'user1', 3, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('allows multiple calls up to limit', () => {
      for (let i = 0; i < 3; i++) {
        const result = checkRateLimit('testOp', 'user1', 3, 60000);
        expect(result.allowed).toBe(true);
      }
    });

    it('blocks calls exceeding limit', () => {
      // Exceed limit
      for (let i = 0; i < 4; i++) {
        checkRateLimit('testOp', 'user1', 3, 60000);
      }
      const result = checkRateLimit('testOp', 'user1', 3, 60000);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('maintains separate limits per user', () => {
      checkRateLimit('testOp', 'user1', 3, 60000);
      checkRateLimit('testOp', 'user1', 3, 60000);
      checkRateLimit('testOp', 'user1', 3, 60000);
      
      // user2 should still have calls available
      const result = checkRateLimit('testOp', 'user2', 3, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('maintains separate limits per operation', () => {
      checkRateLimit('op1', 'user1', 3, 60000);
      checkRateLimit('op1', 'user1', 3, 60000);
      checkRateLimit('op1', 'user1', 3, 60000);
      
      // op2 should have separate limit
      const result = checkRateLimit('op2', 'user1', 3, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('resets after time window expires', async () => {
      const result1 = checkRateLimit('testOp', 'user1', 1, 100); // 100ms window
      expect(result1.allowed).toBe(true);
      
      const result2 = checkRateLimit('testOp', 'user1', 1, 100);
      expect(result2.allowed).toBe(false);
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const result3 = checkRateLimit('testOp', 'user1', 1, 100);
      expect(result3.allowed).toBe(true);
    });

    it('handles missing parameters gracefully', () => {
      const result = checkRateLimit(null, null, 3, 60000);
      expect(result.allowed).toBe(true);
    });
  });

  describe('withRateLimit', () => {
    it('executes function when not rate limited', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      
      const result = await withRateLimit('testOp', 'user1', mockFn, { maxCalls: 3 });
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalled();
    });

    it('throws error when rate limited', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      
      // Exhaust limit
      for (let i = 0; i < 3; i++) {
        checkRateLimit('testOp', 'user2', 3, 60000);
      }
      
      // Next call should throw
      await expect(
        withRateLimit('testOp', 'user2', mockFn, { maxCalls: 3 })
      ).rejects.toThrow();
    });

    it('includes error code and metadata', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      
      // Exhaust limit
      for (let i = 0; i < 3; i++) {
        checkRateLimit('testOp', 'user3', 3, 60000);
      }
      
      try {
        await withRateLimit('testOp', 'user3', mockFn, { maxCalls: 3 });
      } catch (err) {
        expect(err.code).toBe('RATE_LIMIT_EXCEEDED');
        expect(err.remaining).toBe(0);
        expect(err.resetAt).toBeDefined();
      }
    });

    it('propagates async function errors', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('API Error'));
      
      await expect(
        withRateLimit('testOp', 'user4', mockFn, { maxCalls: 3 })
      ).rejects.toThrow('API Error');
    });
  });

  describe('getRateLimitStatus', () => {
    it('returns available slots for new key', () => {
      const status = getRateLimitStatus('testOp', 'user1', 5, 60000);
      
      expect(status.calls).toBe(0);
      expect(status.limit).toBe(5);
      expect(status.available).toBe(5);
    });

    it('tracks used slots', () => {
      checkRateLimit('testOp', 'user2', 5, 60000);
      checkRateLimit('testOp', 'user2', 5, 60000);
      
      const status = getRateLimitStatus('testOp', 'user2', 5, 60000);
      
      expect(status.calls).toBe(2);
      expect(status.available).toBe(3);
    });
  });

  describe('resetRateLimit', () => {
    it('clears rate limit for operation/user pair', () => {
      checkRateLimit('testOp', 'user3', 3, 60000);
      checkRateLimit('testOp', 'user3', 3, 60000);
      checkRateLimit('testOp', 'user3', 3, 60000);
      
      // Verify limited
      let result = checkRateLimit('testOp', 'user3', 3, 60000);
      expect(result.allowed).toBe(false);
      
      // Reset
      resetRateLimit('testOp', 'user3');
      
      // Should work again
      result = checkRateLimit('testOp', 'user3', 3, 60000);
      expect(result.allowed).toBe(true);
    });
  });
});
