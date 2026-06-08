import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sanitizeText, rateLimiter } from '../services/securityService';

describe('Security Functions', () => {
  describe('sanitizeText', () => {
    it('removes HTML tags', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeText(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('removes javascript: protocol', () => {
      const input = '<a href="javascript:alert(1)">click</a>';
      const result = sanitizeText(input);
      expect(result).not.toContain('javascript:');
    });

    it('removes event handlers', () => {
      const input = '<img src=x onclick="alert(1)">';
      const result = sanitizeText(input);
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('on');
    });

    it('removes data: URLs', () => {
      const input = '<iframe src="data:text/html,<script>alert(1)</script>"></iframe>';
      const result = sanitizeText(input);
      expect(result).not.toContain('data:text/html');
    });

    it('encodes special characters', () => {
      const input = 'Hello <World> "quotes" \'apostrophe\'';
      const result = sanitizeText(input);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&quot;');
      expect(result).toContain('&#x27;');
    });

    it('collapses whitespace', () => {
      const input = 'Hello    \n\n   World';
      const result = sanitizeText(input);
      expect(result).toBe('Hello World');
    });

    it('enforces maxLength (default 200)', () => {
      const input = 'a'.repeat(300);
      const result = sanitizeText(input);
      expect(result.length).toBe(200);
    });

    it('enforces custom maxLength', () => {
      const input = 'a'.repeat(100);
      const result = sanitizeText(input, 50);
      expect(result.length).toBe(50);
    });

    it('returns empty string for non-string input', () => {
      expect(sanitizeText(123)).toBe('');
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
      expect(sanitizeText({})).toBe('');
    });

    it('handles normal text without modification', () => {
      const input = 'Hello World 123';
      const result = sanitizeText(input);
      expect(result).toBe('Hello World 123');
    });
  });

  describe('rateLimiter', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('allows calls within rate limit', () => {
      const result1 = rateLimiter.check('test-key', 3, 60000);
      const result2 = rateLimiter.check('test-key', 3, 60000);
      const result3 = rateLimiter.check('test-key', 3, 60000);
      
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
    });

    it('blocks calls exceeding rate limit', () => {
      rateLimiter.check('test-key-2', 2, 60000);
      rateLimiter.check('test-key-2', 2, 60000);
      const result3 = rateLimiter.check('test-key-2', 2, 60000);
      
      expect(result3).toBe(false);
    });

    it('allows new calls after window expires', () => {
      rateLimiter.check('test-key-3', 1, 1000);
      let result2 = rateLimiter.check('test-key-3', 1, 1000);
      expect(result2).toBe(false);
      
      vi.advanceTimersByTime(1001);
      result2 = rateLimiter.check('test-key-3', 1, 1000);
      expect(result2).toBe(true);
    });

    it('maintains separate limits for different keys', () => {
      const result1a = rateLimiter.check('key-a', 1, 60000);
      const result1b = rateLimiter.check('key-b', 1, 60000);
      
      const result2a = rateLimiter.check('key-a', 1, 60000);
      const result2b = rateLimiter.check('key-b', 1, 60000);
      
      expect(result1a).toBe(true);
      expect(result1b).toBe(true);
      expect(result2a).toBe(false);
      expect(result2b).toBe(false);
    });
  });
});
