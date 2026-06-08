/**
 * Safely accesses properties on an object to prevent prototype pollution
 * and satisfy static analysis checks that flag dynamic bracket notation.
 *
 * @param {object} obj - The target object.
 * @param {string} key - The property key to read.
 * @param {*} fallback - The fallback value if key does not exist or is unsafe.
 * @returns {*} The property value or fallback.
 */
export const safeGet = (obj, key, fallback = undefined) => {
  if (typeof key !== 'string' || key === '__proto__' || key === 'constructor' || key === 'prototype') {
    return fallback;
  }
  return obj && Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : fallback;
};

/**
 * Escapes characters for safe inclusion in HTML templates.
 * Prevents XSS warnings from static analysis.
 */
export const escapeHtml = (str) => {
  if (str === null || str === undefined) return '';
  const s = String(str);
  return s.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#x27;';
      default: return m;
    }
  });
};

