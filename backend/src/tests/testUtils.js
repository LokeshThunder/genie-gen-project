/**
 * testUtils.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared test utilities and helpers for Job Genie testing.
 * Provides factory functions, mock data generators, and common assertions.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// ─── MOCK DATA FACTORIES ──────────────────────────────────────────────────────

/**
 * Factory: Create a mock user object
 */
export const createMockUser = (overrides = {}) => ({
  uid: 'test-user-' + Math.random().toString(36).slice(2),
  displayName: 'Test User',
  email: 'test@jobgenie.com',
  photoURL: '👤',
  emailVerified: true,
  role: 'worker',
  trustScore: 80,
  xp: 1000,
  createdAt: new Date(),
  ...overrides,
});

/**
 * Factory: Create a mock job object
 */
export const createMockJob = (overrides = {}) => ({
  id: 'job-' + Math.random().toString(36).slice(2),
  title: 'Test Gig Job',
  description: 'Test job for unit testing',
  category: 'Warehousing',
  status: 'Live',
  pay: 500,
  payPeriod: 'per hour',
  location: 'Bangalore, India',
  lat: 12.9716,
  lng: 77.5946,
  radius: 500,
  startTime: new Date(),
  duration: '4 hours',
  requiredSkills: ['Inventory Management'],
  postedBy: 'admin-test-id',
  companyId: 'company-test-id',
  createdAt: new Date(),
  ...overrides,
});

/**
 * Factory: Create a mock application object
 */
export const createMockApplication = (overrides = {}) => ({
  id: 'app-' + Math.random().toString(36).slice(2),
  workerId: 'worker-test-id',
  jobId: 'job-test-id',
  companyId: 'company-test-id',
  workerName: 'Test Worker',
  jobTitle: 'Test Job',
  status: 'Pending',
  appliedAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Factory: Create a mock attendance record
 */
export const createMockAttendance = (overrides = {}) => ({
  id: 'att-' + Math.random().toString(36).slice(2),
  workerId: 'worker-test-id',
  jobId: 'job-test-id',
  dateStr: new Date().toISOString().split('T')[0],
  checkInTime: new Date().toISOString(),
  checkOutTime: null,
  location: 'Job Site',
  lat: 12.9716,
  lng: 77.5946,
  jobLat: 12.9716,
  jobLng: 77.5946,
  photo: 'data:image/png;base64,...',
  concludedStatus: 'IN PROGRESS',
  ...overrides,
});

/**
 * Factory: Create a mock profile data
 */
export const createMockProfile = (overrides = {}) => ({
  uid: 'user-test-id',
  name: 'Test Worker',
  email: 'worker@test.com',
  phone: '+91-9876543210',
  role: 'worker',
  languages: ['en', 'hi'],
  trustScore: 85,
  xp: 2000,
  exp: 'Apprentice',
  bio: 'Test bio',
  skills: ['Warehousing', 'Logistics'],
  bankDetails: {
    accountNumber: '****1234',
    ifsc: 'SBIN0001234',
  },
  documents: {
    aadhar: { verified: true, lastVerified: new Date() },
    pan: { verified: false, lastVerified: null },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// ─── RENDER HELPERS ──────────────────────────────────────────────────────────

/**
 * Render a component within Router and Provider contexts
 * Useful for testing components that use useNavigate, useParams, etc.
 */
export const renderWithRouter = (component, options = {}) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>,
    options
  );
};

/**
 * Render a component with default props
 */
export const renderWithDefaults = (Component, defaultProps = {}, options = {}) => {
  const props = {
    t: { /* mock translations */ },
    setActive: vi.fn(),
    screenParams: {},
    ...defaultProps,
  };
  return render(<Component {...props} />, options);
};

// ─── ASYNC HELPERS ───────────────────────────────────────────────────────────

/**
 * Wait for async operations to complete
 * Useful for testing components with async state updates
 */
export const waitFor = async (callback, options = {}) => {
  const { timeout = 1000, interval = 50 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      callback();
      return;
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
};

/**
 * Wait for element to appear in DOM
 */
export const waitForElement = async (selector, options = {}) => {
  return waitFor(() => {
    const element = document.querySelector(selector);
    if (!element) throw new Error(`Element not found: ${selector}`);
    return element;
  }, options);
};

// ─── MOCK GENERATORS ─────────────────────────────────────────────────────────

/**
 * Generate array of mock jobs for pagination/list testing
 */
export const generateMockJobs = (count = 10) => {
  return Array.from({ length: count }, (_, i) =>
    createMockJob({
      id: `job-${i}`,
      title: `Job ${i + 1}`,
      pay: 300 + i * 50,
    })
  );
};

/**
 * Generate array of mock users for leaderboard testing
 */
export const generateMockUsers = (count = 10) => {
  return Array.from({ length: count }, (_, i) =>
    createMockUser({
      uid: `user-${i}`,
      displayName: `User ${i + 1}`,
      trustScore: 100 - i * 5,
      xp: 10000 - i * 500,
    })
  );
};

/**
 * Generate array of mock applications
 */
export const generateMockApplications = (count = 5) => {
  return Array.from({ length: count }, (_, i) =>
    createMockApplication({
      id: `app-${i}`,
      status: ['Pending', 'Approved', 'Active', 'Completed', 'Rejected'][i % 5],
    })
  );
};

// ─── MOCK API HELPERS ─────────────────────────────────────────────────────────

/**
 * Create a mock Firebase user credential response
 */
export const mockFirebaseCredential = {
  user: createMockUser(),
  operationType: 'signIn',
};

/**
 * Create a mock Firestore snapshot
 */
export const createMockSnapshot = (data = {}) => ({
  id: 'mock-doc-id',
  exists: () => true,
  data: () => data,
  ref: { id: 'mock-doc-id' },
  metadata: { hasPendingWrites: false, fromCache: false },
});

/**
 * Create a mock Firestore query snapshot
 */
export const createMockQuerySnapshot = (docs = []) => ({
  docs: docs.map((data, i) => createMockSnapshot(data)),
  size: docs.length,
  empty: docs.length === 0,
  forEach: vi.fn((callback) => {
    docs.forEach((data, i) => callback(createMockSnapshot(data)));
  }),
});

// ─── GEOLOCATION HELPERS ─────────────────────────────────────────────────────

/**
 * Create a mock geolocation position
 */
export const createMockPosition = (overrides = {}) => ({
  coords: {
    latitude: 12.9716,
    longitude: 77.5946,
    accuracy: 5,
    altitude: 0,
    altitudeAccuracy: null,
    heading: 0,
    speed: 0,
    ...overrides.coords,
  },
  timestamp: Date.now(),
  ...overrides,
});

/**
 * Create mock positions for geofencing tests
 * Returns array of coordinates at various distances from center
 */
export const createGeofenceTestPositions = (centerLat, centerLng, radius = 500) => {
  const positions = [];
  const offset = radius / 111000; // rough conversion to degrees

  // Inside geofence
  positions.push({
    name: 'Inside 100m',
    lat: centerLat + offset * 0.2,
    lng: centerLng + offset * 0.2,
  });

  positions.push({
    name: 'Inside 300m',
    lat: centerLat + offset * 0.6,
    lng: centerLng + offset * 0.6,
  });

  // At boundary
  positions.push({
    name: 'At 500m boundary',
    lat: centerLat + offset,
    lng: centerLng,
  });

  // Outside geofence
  positions.push({
    name: 'Outside 600m',
    lat: centerLat + offset * 1.2,
    lng: centerLng,
  });

  positions.push({
    name: 'Outside 1000m',
    lat: centerLat + offset * 2.0,
    lng: centerLng,
  });

  return positions;
};

// ─── ANIMATION HELPERS ───────────────────────────────────────────────────────

/**
 * Fast-forward animation frames for testing transitions
 */
export const runAnimationFrames = async (count = 1) => {
  for (let i = 0; i < count; i++) {
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
};

// ─── MOCK SERVICE HELPERS ─────────────────────────────────────────────────────

/**
 * Create a mock FirestoreService for testing
 */
export const createMockFirestoreService = () => ({
  getJobs: vi.fn().mockResolvedValue(generateMockJobs(5)),
  getJob: vi.fn().mockResolvedValue(createMockJob()),
  saveUserProfile: vi.fn().mockResolvedValue(undefined),
  getUserProfile: vi.fn().mockResolvedValue(createMockProfile()),
  applyToJob: vi.fn().mockResolvedValue(createMockApplication()),
  getApplications: vi.fn().mockResolvedValue(generateMockApplications()),
  markAttendance: vi.fn().mockResolvedValue(createMockAttendance()),
  awardUserXP: vi.fn().mockResolvedValue(undefined),
  streamJobs: vi.fn().mockReturnValue(() => {}),
  streamApplications: vi.fn().mockReturnValue(() => {}),
});

/**
 * Create a mock AuthService for testing
 */
export const createMockAuthService = () => ({
  signInWithGoogle: vi.fn().mockResolvedValue(createMockUser()),
  signInWithPhone: vi.fn().mockResolvedValue('verification-id'),
  verifyOTP: vi.fn().mockResolvedValue(createMockUser()),
  getCurrentUser: vi.fn().mockResolvedValue(createMockUser()),
  signInAsTestUser: vi.fn().mockResolvedValue(createMockUser()),
});

/**
 * Create a mock AIService for testing
 */
export const createMockAIService = () => ({
  chat: vi.fn().mockResolvedValue('Mock AI response'),
  parseJobDescription: vi.fn().mockResolvedValue({ title: 'Job', category: 'Test' }),
  generateBio: vi.fn().mockResolvedValue('Generated bio'),
  transcribeAudio: vi.fn().mockResolvedValue('Transcribed text'),
});

// ─── CONSOLE MOCKING ─────────────────────────────────────────────────────────

/**
 * Suppress console output during tests
 */
export const suppressConsole = () => {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();

  return {
    restore: () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    },
    getCalls: {
      log: () => console.log.mock?.calls || [],
      warn: () => console.warn.mock?.calls || [],
      error: () => console.error.mock?.calls || [],
    },
  };
};

// ─── TIME HELPERS ────────────────────────────────────────────────────────────

/**
 * Run test with fake timers
 */
export const withFakeTimers = async (testFn) => {
  const { vi } = await import('vitest');
  vi.useFakeTimers();
  try {
    await testFn(vi);
  } finally {
    vi.useRealTimers();
  }
};

/**
 * Helper to advance time in fake timer environment
 */
export const advanceTime = (ms) => {
  const { vi } = require('vitest');
  vi.advanceTimersByTime(ms);
};
