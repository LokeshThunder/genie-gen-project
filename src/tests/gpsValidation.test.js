import { describe, it, expect } from 'vitest';
import {
  validateIndianBounds,
  calculateDistance,
  validateLocationAccuracy,
  validateLocationChange,
  validateLocation,
  isWithinGeofence,
  findNearestMetroZone
} from '../utils/gpsValidation';

describe('GPS Validation Utility', () => {
  describe('validateIndianBounds', () => {
    it('accepts valid India coordinates', () => {
      const result = validateIndianBounds(28.7041, 77.1025); // Delhi
      expect(result.valid).toBe(true);
    });

    it('accepts Ladakh (north boundary)', () => {
      const result = validateIndianBounds(35.0, 77.0);
      expect(result.valid).toBe(true);
    });

    it('accepts Kanyakumari (south boundary)', () => {
      const result = validateIndianBounds(8.1, 77.5);
      expect(result.valid).toBe(true);
    });

    it('rejects coordinates outside India bounds', () => {
      const result = validateIndianBounds(40.0, 77.0); // Pakistan
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects invalid latitude', () => {
      const result = validateIndianBounds(100, 77.0);
      expect(result.valid).toBe(false);
    });

    it('rejects invalid longitude', () => {
      const result = validateIndianBounds(28.7, 200);
      expect(result.valid).toBe(false);
    });

    it('rejects non-numeric input', () => {
      const result = validateIndianBounds('28.7', '77.1');
      expect(result.valid).toBe(false);
    });
  });

  describe('calculateDistance', () => {
    it('returns 0 for identical coordinates', () => {
      const distance = calculateDistance(28.7, 77.1, 28.7, 77.1);
      expect(distance).toBeCloseTo(0, 2);
    });

    it('calculates distance between Delhi and Mumbai', () => {
      // Delhi: 28.7041, 77.1025; Mumbai: 19.0760, 72.8777
      const distance = calculateDistance(28.7041, 77.1025, 19.0760, 72.8777);
      // Known distance: ~1400 km
      expect(distance).toBeGreaterThan(1300);
      expect(distance).toBeLessThan(1500);
    });

    it('calculates distance between Delhi and Bangalore', () => {
      // Delhi: 28.7, 77.1; Bangalore: 12.97, 77.59
      const distance = calculateDistance(28.7, 77.1, 12.97, 77.59);
      // Known distance: ~1800 km
      expect(distance).toBeGreaterThan(1700);
      expect(distance).toBeLessThan(1900);
    });

    it('handles hemisphere crossing', () => {
      const distanceE = calculateDistance(0, 0, 0, 10);
      const distanceW = calculateDistance(0, 0, 0, -10);
      // Should be similar
      expect(Math.abs(distanceE - distanceW)).toBeLessThan(0.1);
    });
  });

  describe('validateLocationAccuracy', () => {
    it('accepts normal GPS accuracy (50m)', () => {
      const result = validateLocationAccuracy(50);
      expect(result.valid).toBe(true);
    });

    it('accepts large accuracy variation (400m)', () => {
      const result = validateLocationAccuracy(400);
      expect(result.valid).toBe(true);
    });

    it('rejects suspiciously high accuracy (< 5m)', () => {
      const result = validateLocationAccuracy(3);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Suspiciously high');
    });

    it('rejects very poor accuracy (> 500m)', () => {
      const result = validateLocationAccuracy(600);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too low');
    });

    it('rejects invalid accuracy values', () => {
      expect(validateLocationAccuracy(-10).valid).toBe(false);
      expect(validateLocationAccuracy(0).valid).toBe(false);
      expect(validateLocationAccuracy('50').valid).toBe(false);
    });
  });

  describe('validateLocationChange', () => {
    it('allows normal speed within limits', () => {
      // Move 100km in 1 hour = 100km/h (realistic car speed)
      const prev = { lat: 28.7, lng: 77.1 };
      const current = { lat: 29.7, lng: 77.1 };
      
      const result = validateLocationChange(prev, current, 3600); // 1 hour
      expect(result.valid).toBe(true);
      expect(result.speed).toBeGreaterThan(0);
    });

    it('rejects impossible speed (teleportation)', () => {
      // Move 1000km in 1 minute = 60000 km/h (impossible)
      const prev = { lat: 28.7, lng: 77.1 };
      const current = { lat: 10, lng: 90 };
      
      const result = validateLocationChange(prev, current, 60); // 1 minute
      expect(result.valid).toBe(false);
      expect(result.speed).toBeGreaterThan(150);
    });

    it('allows realistic train/airplane speeds', () => {
      // Delhi to Mumbai in 2 hours = 700 km/h
      const prev = { lat: 28.7041, lng: 77.1025 };
      const current = { lat: 19.0760, lng: 72.8777 };
      
      const result = validateLocationChange(prev, current, 7200); // 2 hours
      expect(result.valid).toBe(true);
    });

    it('handles missing coordinates', () => {
      const result1 = validateLocationChange(null, { lat: 28.7, lng: 77.1 }, 3600);
      const result2 = validateLocationChange({ lat: 28.7, lng: 77.1 }, null, 3600);
      
      expect(result1.valid).toBe(true); // Can't validate without both points
      expect(result2.valid).toBe(true);
    });
  });

  describe('validateLocation', () => {
    it('validates complete location successfully', () => {
      const location = { lat: 28.7041, lng: 77.1025, accuracy: 50 };
      const result = validateLocation(location);
      
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('collects multiple validation errors', () => {
      const location = { lat: 100, lng: 200, accuracy: 3 };
      const result = validateLocation(location);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('respects validation options', () => {
      const location = { lat: 40, lng: 77.1 }; // Outside India
      const result = validateLocation(location, { checkBounds: false });
      
      expect(result.valid).toBe(true);
    });

    it('rejects invalid location object', () => {
      const result = validateLocation(null);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid location');
    });
  });

  describe('isWithinGeofence', () => {
    it('allows worker within geofence', () => {
      const worker = { lat: 28.7041, lng: 77.1025 };
      const job = { lat: 28.7041, lng: 77.1025 }; // Same location
      
      const isWithin = isWithinGeofence(worker, job, 500);
      expect(isWithin).toBe(true);
    });

    it('blocks worker outside geofence', () => {
      const worker = { lat: 28.7, lng: 77.0 };
      const job = { lat: 28.7, lng: 77.5 }; // ~50km away
      
      const isWithin = isWithinGeofence(worker, job, 500); // 500m radius
      expect(isWithin).toBe(false);
    });

    it('uses default 500m radius', () => {
      const worker = { lat: 28.7041, lng: 77.1025 };
      const job = { lat: 28.70449, lng: 77.10261 }; // ~50m away
      
      const isWithin = isWithinGeofence(worker, job);
      expect(isWithin).toBe(true);
    });

    it('respects custom radius', () => {
      const worker = { lat: 28.7, lng: 77.0 };
      const job = { lat: 28.705, lng: 77.0 }; // ~5.5km away
      
      expect(isWithinGeofence(worker, job, 1000)).toBe(false); // 1km radius
      expect(isWithinGeofence(worker, job, 10000)).toBe(true); // 10km radius
    });
  });

  describe('findNearestMetroZone', () => {
    it('finds nearest metro (Delhi)', () => {
      const zone = findNearestMetroZone(28.7041, 77.1025); // Delhi coordinates
      expect(zone).toBeDefined();
      expect(zone.distance).toBeLessThan(50);
    });

    it('finds nearest metro (Mumbai)', () => {
      const zone = findNearestMetroZone(19.0760, 72.8777); // Mumbai coordinates
      expect(zone).toBeDefined();
      expect(zone.distance).toBeLessThan(50);
    });

    it('returns null for remote locations', () => {
      const zone = findNearestMetroZone(15.0, 78.0); // Remote area
      expect(zone).toBeNull();
    });

    it('respects zone service radius', () => {
      // Location ~35km from Delhi (outside typical zone radius)
      const zone = findNearestMetroZone(28.0, 77.1);
      expect(zone).toBeNull();
    });
  });
});
