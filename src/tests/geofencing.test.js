import { describe, it, expect } from 'vitest';

// Helper function to calculate distance (copied from jobService)
const calcDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * 
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

describe('Geofencing', () => {
  const GEOFENCE_RADIUS = 0.5; // 500 meters in km
  const jobLat = 13.0827;
  const jobLng = 80.2707; // Chennai coordinates

  describe('calcDistance', () => {
    it('returns 0 when coordinates are identical', () => {
      const distance = calcDistance(jobLat, jobLng, jobLat, jobLng);
      expect(distance).toBeLessThan(0.001); // Allow small float error
    });

    it('calculates distance correctly for known coordinates', () => {
      // Approximately 1.6 km away
      const distance = calcDistance(jobLat, jobLng, 13.1, 80.2);
      expect(distance).toBeGreaterThan(1);
      expect(distance).toBeLessThan(2);
    });

    it('works with negative coordinates (southern hemisphere)', () => {
      const distance = calcDistance(-33.8688, 151.2093, -33.8688, 151.2093);
      expect(distance).toBeLessThan(0.001);
    });

    it('works with different hemispheres', () => {
      // Sydney to NYC (approx 16000 km)
      const distance = calcDistance(-33.8688, 151.2093, 40.7128, -74.006);
      expect(distance).toBeGreaterThan(15000);
      expect(distance).toBeLessThan(17000);
    });
  });

  describe('Geofence validation', () => {
    it('allows check-in within 500m radius', () => {
      // Create a point 200 meters away
      const offset = 200 / 111000; // rough conversion to degrees
      const userLat = jobLat + offset;
      const userLng = jobLng + offset;
      
      const distance = calcDistance(userLat, userLng, jobLat, jobLng);
      expect(distance).toBeLessThan(GEOFENCE_RADIUS);
    });

    it('rejects check-in beyond 500m radius', () => {
      // Create a point 600 meters away
      const offset = 600 / 111000;
      const userLat = jobLat + offset;
      const userLng = jobLng + offset;
      
      const distance = calcDistance(userLat, userLng, jobLat, jobLng);
      expect(distance).toBeGreaterThan(GEOFENCE_RADIUS);
    });

    it('allows check-in at exactly 500m boundary', () => {
      // This tests the inclusive boundary
      const offset = 500 / 111000;
      const userLat = jobLat + offset;
      const userLng = jobLng;
      
      const distance = calcDistance(userLat, userLng, jobLat, jobLng);
      expect(distance).toBeLessThanOrEqual(GEOFENCE_RADIUS + 0.01); // Small tolerance
    });

    it('validates multiple check-ins from different angles', () => {
      const angles = [0, 45, 90, 135, 180, 225, 270, 315];
      
      angles.forEach(angle => {
        const rad = (angle * Math.PI) / 180;
        const offset = 300 / 111000;
        const userLat = jobLat + offset * Math.cos(rad);
        const userLng = jobLng + offset * Math.sin(rad);
        
        const distance = calcDistance(userLat, userLng, jobLat, jobLng);
        expect(distance).toBeLessThan(GEOFENCE_RADIUS);
      });
    });
  });

  describe('Edge cases', () => {
    it('handles zero coordinates', () => {
      const distance = calcDistance(0, 0, 0, 0);
      expect(distance).toBe(0);
    });

    it('handles extreme latitude values', () => {
      const distance = calcDistance(90, 0, 90, 0); // North Pole
      expect(distance).toBe(0);
      
      const distance2 = calcDistance(-90, 0, -90, 0); // South Pole
      expect(distance2).toBe(0);
    });

    it('handles international date line crossing', () => {
      const distance = calcDistance(0, 179.9, 0, -179.9);
      expect(distance).toBeLessThan(0.2); // Very close, just across date line
    });
  });
});
