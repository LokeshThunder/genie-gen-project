/**
 * HapticService provides tactile feedback using the Web Vibration API.
 * This makes the "Industrial Cyber OS" UI feel physical and heavy.
 */
export const HapticService = {
  // Light tap for buttons
  lightTap: () => {
    if (navigator.vibrate) navigator.vibrate(10);
  },

  // Heavy press for critical actions
  heavyPress: () => {
    if (navigator.vibrate) navigator.vibrate(50);
  },

  // Notification / Success
  success: () => {
    if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
  },

  // Error / Warning
  error: () => {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  },

  // The "Vault Lock" effect for Clocking Out
  vaultLock: () => {
    if (navigator.vibrate) navigator.vibrate([30, 100, 30, 100]);
  },

  // The "Coin Hit" effect for receiving pay
  coinHit: () => {
    if (navigator.vibrate) navigator.vibrate([10, 10, 10, 10, 10]);
  },

  // Confirm / Applied Success
  confirmVibration: () => {
    if (navigator.vibrate) navigator.vibrate([15, 30, 60]);
  },

  // Safety / Warning Pulse
  warningPulse: () => {
    if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100, 50, 100]);
  }
};
