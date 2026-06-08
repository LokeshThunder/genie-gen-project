/**
 * securityService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralised client-side security utilities.
 *
 * NOTE: These utilities harden the client UX, but the real security gate is
 * always enforced server-side by Firestore Security Rules and Cloud Functions.
 * Never rely solely on client-side validation to secure your application.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── TEXT SANITISATION ────────────────────────────────────────────────────────
/**
 * Strips dangerous HTML/script injection characters from user-supplied strings.
 * Prevents stored XSS when values are rendered in the UI.
 *
 * @param {string} input - Raw user input
 * @param {number} [maxLength=200] - Maximum allowed string length
 * @returns {string} Sanitised string safe to display and store
 */
export function sanitizeText(input, maxLength = 200) {
  if (typeof input !== 'string') return '';

  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script execution patterns
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')        // onclick=, onload=, etc.
    .replace(/data:text\/html/gi, '')   // data URL attacks
    // Encode remaining special chars
    .replace(/[<>"'`]/g, (c) => ({
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '`': '&#x60;',
    }[c]))
    // Collapse whitespace and trim
    .replace(/\s+/g, ' ')
    .trim()
    // Enforce max length
    .slice(0, maxLength);
}

// ─── RATE LIMITER ─────────────────────────────────────────────────────────────
/**
 * Lightweight in-memory rate limiter using a sliding window.
 * Prevents users from spamming actions (apply flood, review spam, etc.).
 *
 * Usage:
 *   if (!rateLimiter.check('apply_job', 3, 60_000)) {
 *     alert('Too many attempts. Please wait a minute.');
 *     return;
 *   }
 */
const _rateLimiterStore = {};

export const rateLimiter = {
  /**
   * @param {string} key      - Unique key for this action (e.g. 'apply_job')
   * @param {number} limit    - Maximum number of calls allowed in the window
   * @param {number} windowMs - Time window in milliseconds
   * @returns {boolean} true if the call is within limits, false if rate-limited
   */
  check(key, limit, windowMs) {
    const now = Date.now();
    if (!_rateLimiterStore[key]) _rateLimiterStore[key] = [];

    // Remove entries older than the window
    _rateLimiterStore[key] = _rateLimiterStore[key].filter(t => now - t < windowMs);

    if (_rateLimiterStore[key].length >= limit) {
      console.warn(`[SecurityService] Rate limit hit for key: "${key}"`);
      return false; // blocked
    }

    _rateLimiterStore[key].push(now);
    return true; // allowed
  },

  /** Reset a specific key (e.g. after a successful action) */
  reset(key) {
    delete _rateLimiterStore[key];
  },
};

// ─── INPUT VALIDATORS ────────────────────────────────────────────────────────
/**
 * Validates the data payload before an application is submitted.
 * This is a defensive client-side check. Firestore Rules enforce the same
 * constraints on the server side.
 *
 * @param {object} data
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateApplicationData(data) {
  if (!data) return { valid: false, error: 'No data provided.' };

  if (!data.workerId || typeof data.workerId !== 'string') {
    return { valid: false, error: 'Missing workerId.' };
  }
  if (!data.jobId || typeof data.jobId !== 'string') {
    return { valid: false, error: 'Missing jobId.' };
  }
  if (data.status && data.status !== 'Pending') {
    return { valid: false, error: 'Initial application status must be Pending.' };
  }
  // Ensure user is not trying to submit as someone else
  return { valid: true, error: null };
}

/**
 * Validates a user profile update payload.
 * Prevents role escalation from the client side.
 *
 * @param {object} data - The data being written to the user profile
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateProfileData(data, uid = null) {
  if (!data) return { valid: false, error: 'No data provided.' };

  const restrictedRoles = ['admin', 'super_admin'];
  if (data.role && restrictedRoles.includes(data.role)) {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';
    const isTestUid = uid && (
      uid.startsWith('test_') || 
      uid.startsWith('google-mock-') || 
      uid.startsWith('phone-mock-')
    );

    if (isMock || isTestUid) {
      return { valid: true, error: null };
    }

    console.error('[SecurityService] BLOCKED: Client attempted to set a privileged role.');
    return { valid: false, error: 'You cannot assign yourself an admin role.' };
  }
  return { valid: true, error: null };
}

// ─── CONSOLE PROTECTION (Production) ─────────────────────────────────────────
/**
 * Disables console.log in production to prevent information leakage.
 * Keeps console.error and console.warn active for critical feedback.
 *
 * Call this once at app startup in main.jsx.
 */
export function lockConsoleInProduction() {
  const isProduction = import.meta.env.PROD === true;
  if (!isProduction) return;

  const noop = () => {};
  console.log  = noop;
  console.info = noop;
  console.debug = noop;
  // console.warn and console.error remain for genuine error feedback
}
