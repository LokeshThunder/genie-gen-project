/**
 * Storage abstraction layer
 * Decouples the app from localStorage implementation
 * Can be swapped with SessionStorage, IndexedDB, or custom storage later
 */

const STORAGE_PREFIX = 'genie_';

/**
 * Get value from storage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed value or defaultValue
 */
export function getStorageValue(key, defaultValue = null) {
  try {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    const value = localStorage.getItem(fullKey);
    
    if (value === null) {
      return defaultValue;
    }
    
    // Try to parse JSON
    try {
      return JSON.parse(value);
    } catch {
      // Return as string if not JSON
      return value;
    }
  } catch (err) {
    console.error(`[Storage] Error reading key "${key}":`, err);
    return defaultValue;
  }
}

/**
 * Set value in storage
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {boolean} Success indicator
 */
export function setStorageValue(key, value) {
  try {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(fullKey, stringValue);
    return true;
  } catch (err) {
    console.error(`[Storage] Error writing key "${key}":`, err);
    return false;
  }
}

/**
 * Remove value from storage
 * @param {string} key - Storage key to remove
 * @returns {boolean} Success indicator
 */
export function removeStorageValue(key) {
  try {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    localStorage.removeItem(fullKey);
    return true;
  } catch (err) {
    console.error(`[Storage] Error removing key "${key}":`, err);
    return false;
  }
}

/**
 * Clear all Genie-prefixed storage
 * @returns {boolean} Success indicator
 */
export function clearStorage() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (err) {
    console.error('[Storage] Error clearing storage:', err);
    return false;
  }
}

/**
 * Check if a key exists in storage
 * @param {string} key - Storage key
 * @returns {boolean} Key exists
 */
export function hasStorageValue(key) {
  try {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    return localStorage.getItem(fullKey) !== null;
  } catch {
    return false;
  }
}

/**
 * Get all Genie storage keys
 * @returns {string[]} Array of keys (without prefix)
 */
export function getAllStorageKeys() {
  const keys = Object.keys(localStorage);
  return keys
    .filter(key => key.startsWith(STORAGE_PREFIX))
    .map(key => key.replace(STORAGE_PREFIX, ''));
}

// Convenience exports
export const storage = {
  get: getStorageValue,
  set: setStorageValue,
  remove: removeStorageValue,
  clear: clearStorage,
  has: hasStorageValue,
  keys: getAllStorageKeys,
};

export default storage;
