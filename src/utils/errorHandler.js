/**
 * Centralized error handling utility
 * Provides consistent error handling across the app with fallback chains
 */

/**
 * Execute async function with fallback
 * @param {Function} fn - Main async function to execute
 * @param {Function|*} fallback - Fallback (function to call or value to return)
 * @param {string} context - Context for logging (e.g., 'aiService.chat')
 * @returns {Promise<*>} Result from fn or fallback
 */
export async function safeCall(fn, fallback, context = 'unknown') {
  try {
    return await fn();
  } catch (err) {
    console.warn(`[${context}] Error, using fallback:`, err.message);
    
    if (typeof fallback === 'function') {
      try {
        return await fallback();
      } catch (fallbackErr) {
        console.error(`[${context}] Fallback failed:`, fallbackErr.message);
        return null;
      }
    }
    
    return fallback;
  }
}

/**
 * Execute function with retry logic
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Max retry attempts
 * @param {number} delayMs - Delay between retries (ms)
 * @param {string} context - Context for logging
 * @returns {Promise<*>} Function result
 */
export async function retryCall(fn, maxRetries = 3, delayMs = 1000, context = 'unknown') {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) {
        console.error(`[${context}] Failed after ${maxRetries} retries:`, err.message);
        throw err;
      }
      
      console.warn(`[${context}] Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Execute with timeout
 * @param {Promise} promise - Promise to wrap
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} context - Context for logging
 * @returns {Promise<*>} Promise result or timeout error
 */
export async function withTimeout(promise, timeoutMs = 5000, context = 'unknown') {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
  );
  
  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (err) {
    console.warn(`[${context}] ${err.message}`);
    throw err;
  }
}

/**
 * Create error with context
 * @param {string} message - Error message
 * @param {string} context - Where error occurred
 * @param {*} originalError - Original error object
 * @returns {Error} Enhanced error
 */
export function createContextError(message, context, originalError = null) {
  const err = new Error(`[${context}] ${message}`);
  err.context = context;
  err.originalError = originalError;
  return err;
}

/**
 * Log error safely
 * @param {Error|string} error - Error to log
 * @param {string} context - Where error occurred
 * @param {object} extra - Extra data to log
 */
export function logError(error, context = 'unknown', extra = {}) {
  const message = error?.message || String(error);
  const stack = error?.stack || '';
  
  console.error(`[${context}] ${message}`, {
    stack,
    ...extra,
  });
  
  // In production, send to error tracking service (Sentry, LogRocket, etc.)
  // if (import.meta.env.MODE === 'production') {
  //   Sentry.captureException(error, { tags: { context }, contexts: { extra } });
  // }
}

/**
 * Check if error is a specific type
 * @param {Error} error - Error to check
 * @param {string} type - Error type ('timeout', 'network', 'auth', 'validation')
 * @returns {boolean}
 */
export function isErrorType(error, type) {
  const message = error?.message?.toLowerCase() || '';
  
  const types = {
    timeout: ['timeout', 'took too long'],
    network: ['network', 'fetch', 'cors', 'connection'],
    auth: ['unauthorized', 'forbidden', 'auth', 'permission'],
    validation: ['validation', 'invalid', 'required', 'malformed'],
    notfound: ['not found', 'does not exist', 'not found'],
  };
  
  return types[type]?.some(keyword => message.includes(keyword)) || false;
}

/**
 * User-friendly error message
 * @param {Error} error - Error to translate
 * @param {object} translations - Translation object
 * @returns {string} User-friendly message
 */
export function getUserFriendlyMessage(error, translations = {}) {
  const defaultMessages = {
    timeout: 'Request took too long. Please try again.',
    network: 'Network error. Please check your connection.',
    auth: 'Authentication failed. Please log in again.',
    validation: 'Invalid input. Please check your data.',
    notfound: 'Resource not found.',
    unknown: 'Something went wrong. Please try again.',
  };
  
  const messages = { ...defaultMessages, ...translations };
  
  if (isErrorType(error, 'timeout')) return messages.timeout;
  if (isErrorType(error, 'network')) return messages.network;
  if (isErrorType(error, 'auth')) return messages.auth;
  if (isErrorType(error, 'validation')) return messages.validation;
  if (isErrorType(error, 'notfound')) return messages.notfound;
  
  return messages.unknown;
}

export default {
  safeCall,
  retryCall,
  withTimeout,
  createContextError,
  logError,
  isErrorType,
  getUserFriendlyMessage,
};
