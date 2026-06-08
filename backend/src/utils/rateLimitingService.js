/**
 * Rate Limiting Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Implements sliding-window rate limiting to protect mutations from abuse.
 * Prevents rapid successive calls that could flood Firestore or cause spam.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Key format: `${operation}:${identifier}` (e.g., "createJob:admin123")
const rateLimitStore = new Map();

/**
 * Check if operation is rate limited
 * @param {string} operation - Operation name (createJob, submitRating, etc.)
 * @param {string} identifier - User ID or unique identifier
 * @param {number} maxCalls - Max calls allowed per time window (default: 3)
 * @param {number} windowMs - Time window in milliseconds (default: 60000 = 1 min)
 * @returns {object} { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(operation, identifier, maxCalls = 3, windowMs = 60000) {
  if (!operation || !identifier) {
    console.warn('[RateLimitingService] Missing operation or identifier');
    return { allowed: true, remaining: maxCalls, resetAt: Date.now() + windowMs };
  }

  const key = `${operation}:${identifier}`;
  const now = Date.now();
  let record = rateLimitStore.get(key);

  // Initialize or reset if window expired
  if (!record || now > record.resetAt) {
    record = {
      count: 0,
      resetAt: now + windowMs,
      calls: []
    };
    rateLimitStore.set(key, record);
  }

  // Remove old calls outside the window
  record.calls = record.calls.filter(timestamp => now - timestamp < windowMs);

  // Check if rate limit exceeded
  const allowed = record.calls.length < maxCalls;

  if (allowed) {
    record.calls.push(now);
  }

  const remaining = Math.max(0, maxCalls - record.calls.length);
  const resetAt = record.resetAt;

  return { allowed, remaining, resetAt };
}

/**
 * Async wrapper for mutation with rate limiting
 * Throws an error if rate limited
 * @param {string} operation - Operation name
 * @param {string} identifier - User ID or identifier
 * @param {function} mutationFn - Async function to execute
 * @param {object} options - Rate limiting options { maxCalls, windowMs }
 * @returns {Promise} Result of mutation or throws RateLimitError
 */
export async function withRateLimit(operation, identifier, mutationFn, options = {}) {
  const { maxCalls = 3, windowMs = 60000 } = options;
  
  const { allowed, remaining, resetAt } = checkRateLimit(operation, identifier, maxCalls, windowMs);
  
  if (!allowed) {
    const waitTime = Math.ceil((resetAt - Date.now()) / 1000);
    const error = new Error(
      `[RateLimitingService] ${operation} rate limit exceeded. ` +
      `Try again in ${waitTime}s. Remaining: ${remaining}/${maxCalls}`
    );
    error.code = 'RATE_LIMIT_EXCEEDED';
    error.resetAt = resetAt;
    error.remaining = remaining;
    throw error;
  }

  try {
    const result = await mutationFn();
    return result;
  } catch (err) {
    // Don't swallow the mutation error
    throw err;
  }
}

/**
 * Reset rate limit for a specific operation/identifier pair
 * Useful for testing or admin override
 */
export function resetRateLimit(operation, identifier) {
  const key = `${operation}:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status without modifying it
 */
export function getRateLimitStatus(operation, identifier, maxCalls = 3, windowMs = 60000) {
  const key = `${operation}:${identifier}`;
  const record = rateLimitStore.get(key);
  
  if (!record) {
    return { calls: 0, limit: maxCalls, available: maxCalls };
  }

  const now = Date.now();
  const activeCalls = record.calls.filter(timestamp => now - timestamp < windowMs);
  
  return {
    calls: activeCalls.length,
    limit: maxCalls,
    available: Math.max(0, maxCalls - activeCalls.length),
    resetAt: record.resetAt
  };
}
