/**
 * GPS Location Validation Utility
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates GPS coordinates against India's geographic bounds and performs
 * sanity checks to prevent spoofed or corrupted location data.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// India's approximate geographic bounds
const INDIA_BOUNDS = {
  northLat: 35.5, // Ladakh
  southLat: 8.0,  // Kanyakumari
  eastLng: 97.5,  // Arunachal Pradesh
  westLng: 68.7   // Gujarat
};

// Additional validation zones (specific to India's major gig work regions)
const MAJOR_METRO_ZONES = [
  // Delhi NCR
  { center: { lat: 28.7041, lng: 77.1025 }, radius: 40 },
  // Mumbai
  { center: { lat: 19.0760, lng: 72.8777 }, radius: 30 },
  // Bangalore
  { center: { lat: 12.9716, lng: 77.5946 }, radius: 25 },
  // Hyderabad
  { center: { lat: 17.3850, lng: 78.4867 }, radius: 20 },
  // Chennai
  { center: { lat: 13.0827, lng: 80.2707 }, radius: 20 },
  // Kolkata
  { center: { lat: 22.5726, lng: 88.3639 }, radius: 20 }
];

/**
 * Validates if coordinates are within India's geographic bounds
 * @param {number} latitude - Latitude (-90 to 90)
 * @param {number} longitude - Longitude (-180 to 180)
 * @returns {object} { valid: boolean, error?: string }
 */
export function validateIndianBounds(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return { valid: false, error: 'Coordinates must be numbers' };
  }

  if (latitude < -90 || latitude > 90) {
    return { valid: false, error: 'Invalid latitude: must be between -90 and 90' };
  }

  if (longitude < -180 || longitude > 180) {
    return { valid: false, error: 'Invalid longitude: must be between -180 and 180' };
  }

  // Check India bounds
  if (
    latitude < INDIA_BOUNDS.southLat ||
    latitude > INDIA_BOUNDS.northLat ||
    longitude < INDIA_BOUNDS.westLng ||
    longitude > INDIA_BOUNDS.eastLng
  ) {
    return {
      valid: false,
      error: `Location outside India bounds. Got: (${latitude}, ${longitude})`
    };
  }

  return { valid: true };
}

/**
 * Calculates distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 * @param {number} lat1 - Start latitude
 * @param {number} lng1 - Start longitude
 * @param {number} lat2 - End latitude
 * @param {number} lng2 - End longitude
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Validates location accuracy (prevents suspiciously low accuracy values)
 * @param {number} accuracy - Accuracy in meters (from geolocation API)
 * @returns {object} { valid: boolean, error?: string }
 */
export function validateLocationAccuracy(accuracy) {
  if (typeof accuracy !== 'number' || accuracy <= 0) {
    return { valid: false, error: 'Invalid accuracy value' };
  }

  // GPS accuracy of less than 5 meters is suspiciously high (possible spoofing)
  if (accuracy < 5) {
    return { valid: false, error: 'Suspiciously high GPS accuracy (< 5m): possible spoofing' };
  }

  // GPS accuracy worse than 500 meters is too imprecise for geofencing
  if (accuracy > 500) {
    return { valid: false, error: 'GPS accuracy too low (> 500m): cannot verify geofence' };
  }

  return { valid: true };
}

/**
 * Validates rapid location changes (detects teleportation)
 * Compares previous and current location with time delta
 * @param {object} prevCoords - Previous location { lat, lng }
 * @param {object} currentCoords - Current location { lat, lng }
 * @param {number} deltaTimeSec - Time elapsed in seconds
 * @returns {object} { valid: boolean, error?: string, speed?: number }
 */
export function validateLocationChange(prevCoords, currentCoords, deltaTimeSec) {
  if (!prevCoords || !currentCoords) {
    return { valid: true }; // Cannot validate without both points
  }

  const distanceKm = calculateDistance(
    prevCoords.lat,
    prevCoords.lng,
    currentCoords.lat,
    currentCoords.lng
  );

  const deltaHours = deltaTimeSec / 3600;
  const speedKmh = distanceKm / deltaHours;

  // Max realistic speed for human transport: ~150 km/h (fast train/car)
  const MAX_REALISTIC_SPEED = 150;

  if (speedKmh > MAX_REALISTIC_SPEED) {
    return {
      valid: false,
      error: `Impossible speed detected: ${speedKmh.toFixed(1)} km/h (max realistic: ${MAX_REALISTIC_SPEED} km/h)`,
      speed: speedKmh
    };
  }

  return { valid: true, speed: speedKmh };
}

/**
 * Comprehensive location validation combining multiple checks
 * @param {object} location - Location object { lat, lng, accuracy }
 * @param {object} options - Validation options
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateLocation(location, options = {}) {
  const { checkBounds = true, checkAccuracy = true, maxAccuracy = 500 } = options;
  const errors = [];

  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    return { valid: false, errors: ['Invalid location object'] };
  }

  // Check India bounds
  if (checkBounds) {
    const boundsResult = validateIndianBounds(location.lat, location.lng);
    if (!boundsResult.valid) {
      errors.push(boundsResult.error);
    }
  }

  // Check accuracy
  if (checkAccuracy && typeof location.accuracy === 'number') {
    const accuracyResult = validateLocationAccuracy(location.accuracy);
    if (!accuracyResult.valid) {
      errors.push(accuracyResult.error);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Checks if location is within a job site's geofence
 * @param {object} workerCoords - Worker's current location { lat, lng }
 * @param {object} jobCoords - Job site location { lat, lng }
 * @param {number} radiusMeters - Geofence radius in meters (default 500)
 * @returns {boolean} true if worker is within geofence
 */
export function isWithinGeofence(workerCoords, jobCoords, radiusMeters = 500) {
  const distanceKm = calculateDistance(
    workerCoords.lat,
    workerCoords.lng,
    jobCoords.lat,
    jobCoords.lng
  );
  const distanceMeters = distanceKm * 1000;
  return distanceMeters <= radiusMeters;
}

/**
 * Finds nearest major metro zone to given coordinates
 * Useful for analytics and job recommendations
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {object|null} Nearest metro zone or null if too far from all zones
 */
export function findNearestMetroZone(latitude, longitude) {
  const workerCoords = { lat: latitude, lng: longitude };
  
  let nearestZone = null;
  let minDistance = Infinity;

  for (const zone of MAJOR_METRO_ZONES) {
    const distance = calculateDistance(
      workerCoords.lat,
      workerCoords.lng,
      zone.center.lat,
      zone.center.lng
    );

    // Check if within zone's service radius
    if (distance <= zone.radius && distance < minDistance) {
      minDistance = distance;
      nearestZone = { ...zone, distance };
    }
  }

  return nearestZone;
}

export default {
  validateIndianBounds,
  calculateDistance,
  validateLocationAccuracy,
  validateLocationChange,
  validateLocation,
  isWithinGeofence,
  findNearestMetroZone
};
