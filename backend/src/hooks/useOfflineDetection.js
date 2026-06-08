/**
 * useOfflineDetection Hook
 * ─────────────────────────────────────────────────────────────────────────────
 * Global offline detection hook that monitors network connectivity and provides
 * offline status, auto-sync queuing, and retry logic for failed requests.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Module-level store for offline state to share across all hook instances
let globalIsOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
const offlineListeners = new Set();

// Broadcast online/offline status to all hook instances
function notifyOfflineListeners(isOnline) {
  offlineListeners.forEach(callback => callback(isOnline));
}

export function useOfflineDetection() {
  const [isOnline, setIsOnline] = useState(globalIsOnline);
  const [lastChecked, setLastChecked] = useState(Date.now());
  const [offlineQueue, setOfflineQueue] = useState([]);
  const reconnectTimeoutRef = useRef(null);

  // Add this instance's callback to global listeners
  useEffect(() => {
    const handleOfflineChange = (newStatus) => {
      globalIsOnline = newStatus;
      setIsOnline(newStatus);
      setLastChecked(Date.now());
    };

    offlineListeners.add(handleOfflineChange);
    return () => offlineListeners.delete(handleOfflineChange);
  }, []);

  // Setup global online/offline listeners
  useEffect(() => {
    const handleOnline = () => {
      globalIsOnline = true;
      notifyOfflineListeners(true);
      setIsOnline(true);
      setLastChecked(Date.now());
    };

    const handleOffline = () => {
      globalIsOnline = false;
      notifyOfflineListeners(false);
      setIsOnline(false);
      setLastChecked(Date.now());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Queue async action for later retry when offline
  const queueOfflineAction = useCallback((action) => {
    if (!isOnline) {
      setOfflineQueue(prev => [...prev, {
        id: Date.now(),
        action,
        timestamp: new Date(),
        retries: 0
      }]);
      return true;
    }
    return false;
  }, [isOnline]);

  // Retry queued actions when coming back online
  const retryOfflineQueue = useCallback(async () => {
    if (!isOnline || offlineQueue.length === 0) return;

    setOfflineQueue(prev => {
      const remaining = [];
      
      prev.forEach(item => {
        try {
          if (typeof item.action === 'function') {
            item.action();
          }
        } catch (err) {
          console.warn(`[OfflineDetection] Retry failed for action ${item.id}:`, err);
          if (item.retries < 3) {
            item.retries++;
            remaining.push(item);
          }
        }
      });

      return remaining;
    });
  }, [isOnline, offlineQueue.length]);

  // Manually check connectivity with fetch
  const checkConnectivity = useCallback(async () => {
    try {
      const response = await fetch('https://www.google.com/favicon.ico', { method: 'HEAD', mode: 'no-cors' });
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    isOnline,
    lastChecked,
    offlineQueueSize: offlineQueue.length,
    queueOfflineAction,
    retryOfflineQueue,
    checkConnectivity
  };
}

export default useOfflineDetection;
