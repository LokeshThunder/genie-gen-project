/**
 * Request Timeout Protection Wrapper
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps async service calls with configurable timeouts to prevent hanging
 * requests and provide graceful fallback/retry behavior.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Wraps a promise with a timeout
 * @param {Promise} promise - The promise to wrap
 * @param {number} timeoutMs - Timeout in milliseconds (default: 30000 = 30s)
 * @param {string} operationName - Name of operation for error logging
 * @returns {Promise} Original promise or timeout error
 */
export function withTimeout(promise, timeoutMs = 30000, operationName = 'Operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => {
        const error = new Error(
          `[RequestTimeout] ${operationName} exceeded ${timeoutMs}ms timeout`
        );
        error.code = 'TIMEOUT';
        error.timeoutMs = timeoutMs;
        reject(error);
      }, timeoutMs)
    )
  ]);
}

/**
 * Wraps a service call with timeout and automatic retry logic
 * @param {function} asyncFn - Async function to execute
 * @param {object} options - Configuration options
 * @returns {Promise} Result of async function or throws error
 */
export async function withTimeoutAndRetry(asyncFn, options = {}) {
  const {
    timeoutMs = 30000,
    maxRetries = 2,
    backoffMs = 1000,
    operationName = 'Operation',
    onRetry = null
  } = options;

  let lastError;
  let currentBackoff = backoffMs;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      // Attempt with timeout
      const result = await withTimeout(asyncFn(), timeoutMs, operationName);
      return result;
    } catch (err) {
      lastError = err;

      const isLastAttempt = attempt === maxRetries + 1;
      const isTimeoutError = err.code === 'TIMEOUT';
      const shouldRetry = !isLastAttempt && (isTimeoutError || err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET');

      if (shouldRetry) {
        console.warn(
          `[RequestTimeout] ${operationName} failed (attempt ${attempt}/${maxRetries + 1}):`,
          err.message,
          `Retrying in ${currentBackoff}ms...`
        );

        if (onRetry) {
          onRetry(attempt, err);
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, currentBackoff));
        currentBackoff = Math.min(currentBackoff * 2, 10000); // Cap at 10s
      } else {
        // Not a retryable error, throw immediately
        throw err;
      }
    }
  }

  // All retries exhausted
  throw lastError;
}

/**
 * Wraps a Firestore read with timeout
 * For list queries that might hang or return slowly
 * @param {function} firestoreFn - Firestore function (e.g., getDoc, getDocs)
 * @param {object} options - Timeout options
 * @returns {Promise} Firestore result or throws timeout error
 */
export async function withFirestoreTimeout(firestoreFn, options = {}) {
  const { timeoutMs = 15000, operationName = 'Firestore Read' } = options;

  return withTimeout(firestoreFn(), timeoutMs, operationName);
}

/**
 * Wraps multiple concurrent requests with timeout
 * If any request times out, returns partial results and error summary
 * @param {object} requests - Object map of {name: promiseFunction}
 * @param {number} timeoutMs - Timeout per request
 * @returns {object} {results, errors, successful, failed}
 */
export async function withConcurrentTimeout(requests, timeoutMs = 30000) {
  const results = {};
  const errors = {};
  let successful = 0;
  let failed = 0;

  const promises = Object.entries(requests).map(async ([name, promiseFn]) => {
    try {
      const result = await withTimeout(promiseFn(), timeoutMs, name);
      results[name] = result;
      successful++;
    } catch (err) {
      errors[name] = err.message;
      failed++;
    }
  });

  await Promise.all(promises);

  return { results, errors, successful, failed };
}

/**
 * Circuit breaker pattern for service reliability
 * Temporarily disable calls to failing service
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeoutMs = options.resetTimeoutMs || 60000;
    this.state = 'CLOSED'; // CLOSED | OPEN | HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.resetTimer = null;
  }

  async execute(asyncFn, operationName = 'Operation') {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        console.info(`[CircuitBreaker] ${operationName} entering HALF_OPEN state`);
      } else {
        const error = new Error(
          `[CircuitBreaker] ${operationName} circuit is OPEN. Service temporarily unavailable.`
        );
        error.code = 'CIRCUIT_OPEN';
        throw error;
      }
    }

    try {
      const result = await asyncFn();
      
      // Success - reset circuit if in HALF_OPEN
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
        console.info(`[CircuitBreaker] ${operationName} circuit CLOSED`);
      }

      return result;
    } catch (err) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN';
        console.error(
          `[CircuitBreaker] ${operationName} circuit OPEN after ${this.failureCount} failures`
        );
      }

      throw err;
    }
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

export default {
  withTimeout,
  withTimeoutAndRetry,
  withFirestoreTimeout,
  withConcurrentTimeout,
  CircuitBreaker
};
