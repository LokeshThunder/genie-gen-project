import { FirestoreService } from './firestoreService';

let heartbeatInterval = null;

export const HeartbeatService = {
  startHeartbeat(userId, jobId, jobLocation, onAlert) {
    if (heartbeatInterval) return;

    console.log(`[Heartbeat] STARTING pulse for Job ${jobId}...`);
    
    heartbeatInterval = setInterval(async () => {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const currentLoc = `${latitude},${longitude}`;
        
        console.log(`[Heartbeat] Pulse at ${new Date().toLocaleTimeString()}: ${currentLoc}`);

        // Simple Distance Check (Mock/Simplified)
        // If the distance from jobLocation is > 0.003 (~300m), trigger alert
        if (jobLocation) {
          const [targetLat, targetLng] = jobLocation.split(',').map(Number);
          const dist = Math.sqrt(Math.pow(latitude - targetLat, 2) + Math.pow(longitude - targetLng, 2));
          
          if (dist > 0.003) { // Rough 300m in lat/lng units
            console.warn("[Heartbeat] DEPARTURE DETECTED!");
            await this.logAlert(userId, jobId, currentLoc);
            if (onAlert) onAlert({ type: 'DEPARTURE', location: currentLoc });
          }
        }
      });
    }, 60000); // Check every 60 seconds (for demo, 2h in prod)
  },

  stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
      console.log("[Heartbeat] STOPPED.");
    }
  },

  async logAlert(userId, jobId, location) {
    const alertData = {
      type: 'DEPARTURE',
      userId,
      jobId,
      location,
      timestamp: new Date().toISOString(),
      status: 'UNAUTHORIZED'
    };
    
    // Save to LocalStorage for persistence
    const alerts = JSON.parse(localStorage.getItem('genie_alerts') || '[]');
    alerts.push(alertData);
    localStorage.setItem('genie_alerts', JSON.stringify(alerts));
    
    // Try to sync to Firestore
    try {
        // We'll add a logAlert method to FirestoreService later if needed
        console.log("[Heartbeat] Alert logged successfully.");
    } catch (e) {
        console.error("[Heartbeat] Sync failed.");
    }
  }
};
