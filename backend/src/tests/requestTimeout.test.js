import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  withTimeout,
  withTimeoutAndRetry,
  CircuitBreaker
} from '../utils/requestTimeout';

describe('Request Timeout Protection', () => {
  describe('withTimeout', () => {
    it('returns result when promise resolves within timeout', async () => {
      const promise = new Promise(resolve => {
        setTimeout(() => resolve('success'), 100);
      });
      
      const result = await withTimeout(promise, 500, 'Test Operation');
      expect(result).toBe('success');
    });

    it('throws timeout error when promise exceeds timeout', async () => {
      const promise = new Promise(resolve => {
        setTimeout(() => resolve('slow'), 500);
      });
      
      await expect(withTimeout(promise, 100, 'Test Operation'))
        .rejects.toThrow('exceeded 100ms timeout');
    });

    it('includes operation name in error message', async () => {
      const promise = new Promise(resolve => {
        setTimeout(() => resolve('slow'), 500);
      });
      
      try {
        await withTimeout(promise, 100, 'Custom Operation');
      } catch (err) {
        expect(err.message).toContain('Custom Operation');
        expect(err.code).toBe('TIMEOUT');
      }
    });

    it('propagates promise rejection', async () => {
      const promise = Promise.reject(new Error('API Error'));
      
      await expect(withTimeout(promise, 500, 'Test'))
        .rejects.toThrow('API Error');
    });

    it('uses default 30s timeout', async () => {
      const longPromise = new Promise(resolve => {
        setTimeout(() => resolve('never'), 31000);
      });
      
      const startTime = Date.now();
      await expect(withTimeout(longPromise, undefined, 'Test'))
        .rejects.toThrow('exceeded 30000ms timeout');
      
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThan(29000);
      expect(elapsed).toBeLessThan(31000);
    });
  });

  describe('withTimeoutAndRetry', () => {
    it('succeeds on first attempt', async () => {
      const asyncFn = vi.fn().mockResolvedValue('success');
      
      const result = await withTimeoutAndRetry(asyncFn, { timeoutMs: 1000 });
      
      expect(result).toBe('success');
      expect(asyncFn).toHaveBeenCalledTimes(1);
    });

    it('retries on timeout', async () => {
      let attempt = 0;
      const asyncFn = vi.fn(async () => {
        attempt++;
        if (attempt === 1) {
          return new Promise(resolve => setTimeout(resolve, 5000)); // Timeout
        }
        return 'success';
      });
      
      const result = await withTimeoutAndRetry(asyncFn, {
        timeoutMs: 100,
        maxRetries: 1,
        backoffMs: 50
      });
      
      expect(result).toBe('success');
      expect(asyncFn).toHaveBeenCalledTimes(2);
    });

    it('throws after max retries exceeded', async () => {
      const asyncFn = vi.fn().mockRejectedValue(new Error('Connection error'));
      
      await expect(
        withTimeoutAndRetry(asyncFn, {
          timeoutMs: 100,
          maxRetries: 1,
          backoffMs: 50
        })
      ).rejects.toThrow('Connection error');
      
      expect(asyncFn).toHaveBeenCalledTimes(2); // Original + 1 retry
    });

    it('uses exponential backoff', async () => {
      const asyncFn = vi.fn().mockRejectedValue(new Error('Error'));
      
      const startTime = Date.now();
      
      await expect(
        withTimeoutAndRetry(asyncFn, {
          timeoutMs: 50,
          maxRetries: 2,
          backoffMs: 100
        })
      ).rejects.toThrow();
      
      const elapsed = Date.now() - startTime;
      // First retry after 100ms, second after 200ms = 300ms minimum
      expect(elapsed).toBeGreaterThan(250);
    });

    it('calls onRetry callback on retry', async () => {
      const onRetry = vi.fn();
      const asyncFn = vi.fn().mockRejectedValue(new Error('Error'));
      
      await expect(
        withTimeoutAndRetry(asyncFn, {
          timeoutMs: 100,
          maxRetries: 2,
          backoffMs: 50,
          onRetry
        })
      ).rejects.toThrow();
      
      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });

    it('does not retry non-timeout errors by default', async () => {
      const asyncFn = vi.fn().mockRejectedValue(new Error('Validation error'));
      
      await expect(
        withTimeoutAndRetry(asyncFn, {
          timeoutMs: 1000,
          maxRetries: 2
        })
      ).rejects.toThrow('Validation error');
      
      expect(asyncFn).toHaveBeenCalledTimes(1);
    });

    it('includes operation name in logs', async () => {
      const asyncFn = vi.fn().mockRejectedValue(new Error('Error'));
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation();
      
      await expect(
        withTimeoutAndRetry(asyncFn, {
          timeoutMs: 100,
          maxRetries: 1,
          backoffMs: 50,
          operationName: 'Custom API Call'
        })
      ).rejects.toThrow();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Custom API Call'),
        expect.any(String)
      );
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('CircuitBreaker', () => {
    it('starts in CLOSED state', () => {
      const breaker = new CircuitBreaker();
      const state = breaker.getState();
      
      expect(state.state).toBe('CLOSED');
    });

    it('executes function successfully when CLOSED', async () => {
      const breaker = new CircuitBreaker();
      const fn = vi.fn().mockResolvedValue('success');
      
      const result = await breaker.execute(fn, 'Test Operation');
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalled();
    });

    it('opens after threshold failures', async () => {
      const breaker = new CircuitBreaker({ failureThreshold: 2 });
      const fn = vi.fn().mockRejectedValue(new Error('Error'));
      
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(fn, 'Test');
        } catch (e) {
          // Expected
        }
      }
      
      const state = breaker.getState();
      expect(state.state).toBe('OPEN');
      expect(state.failureCount).toBe(2);
    });

    it('rejects requests when OPEN', async () => {
      const breaker = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 5000 });
      const fn = vi.fn().mockRejectedValue(new Error('Error'));
      
      try {
        await breaker.execute(fn, 'Test');
      } catch (e) {
        // Expected
      }
      
      await expect(
        breaker.execute(() => Promise.resolve('success'), 'Test')
      ).rejects.toThrow('circuit is OPEN');
    });

    it('transitions to HALF_OPEN after reset timeout', async () => {
      const breaker = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 100 });
      const fn = vi.fn().mockRejectedValue(new Error('Error'));
      
      // Open circuit
      try {
        await breaker.execute(fn, 'Test');
      } catch (e) {
        // Expected
      }
      
      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const state = breaker.getState();
      expect(state.state).toBe('HALF_OPEN');
    });

    it('closes when HALF_OPEN request succeeds', async () => {
      const breaker = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 100 });
      const fn = vi.fn().mockRejectedValue(new Error('Error'));
      
      // Open circuit
      try {
        await breaker.execute(fn, 'Test');
      } catch (e) {
        // Expected
      }
      
      // Wait for HALF_OPEN
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Execute successful function
      const successFn = vi.fn().mockResolvedValue('success');
      const result = await breaker.execute(successFn, 'Test');
      
      expect(result).toBe('success');
      const state = breaker.getState();
      expect(state.state).toBe('CLOSED');
    });

    it('can be manually reset', async () => {
      const breaker = new CircuitBreaker();
      const fn = vi.fn().mockRejectedValue(new Error('Error'));
      
      // Cause failures
      for (let i = 0; i < 5; i++) {
        try {
          await breaker.execute(fn, 'Test');
        } catch (e) {
          // Expected
        }
      }
      
      // Verify OPEN
      let state = breaker.getState();
      expect(state.state).toBe('OPEN');
      
      // Reset
      breaker.reset();
      
      // Verify CLOSED
      state = breaker.getState();
      expect(state.state).toBe('CLOSED');
      expect(state.failureCount).toBe(0);
    });
  });
});
