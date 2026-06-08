/**
 * Formats a 24-hour time string (e.g. "08:00") to 12-hour AM/PM format (e.g. "08:00 AM")
 * @param {string} time24 
 * @returns {string}
 */
export const format12h = (time24) => {
  if (!time24 || typeof time24 !== 'string') return time24;
  const [hours, minutes] = time24.split(':');
  if (isNaN(hours) || isNaN(minutes)) return time24;
  
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

/**
 * Returns current time in IST (Indian Standard Time)
 * @returns {Date}
 */
export const getCurrentIST = () => {
  const now = new Date();
  // If the environment is already in IST, this is fine.
  // Otherwise, we can force it, but for a local dev app, local time is usually the user's time.
  return now;
};

/**
 * Formats a date to Indian display format (HH:MM:SS AM/PM)
 * @param {Date} date 
 * @returns {string}
 */
export const formatISTDisplay = (date) => {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  }).toUpperCase();
};
