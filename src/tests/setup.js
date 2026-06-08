import { expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// ─── CLEANUP ─────────────────────────────────────────────────────────────────
// Clean up React components after each test to prevent memory leaks
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ─── WINDOW MOCKS ────────────────────────────────────────────────────────────

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.innerWidth/innerHeight for responsive tests
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 375, // Mobile width
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 812, // Mobile height
});

// Mock window.requestAnimationFrame for animation tests
global.requestAnimationFrame = vi.fn(callback => setTimeout(callback, 16));
global.cancelAnimationFrame = vi.fn(id => clearTimeout(id));

// ─── STORAGE MOCKS ───────────────────────────────────────────────────────────

// Mock localStorage with actual in-memory storage for testing
const _localStorageData = {};

global.localStorage = {
  getItem: vi.fn((key) => _localStorageData[key] || null),
  setItem: vi.fn((key, value) => {
    _localStorageData[key] = String(value);
  }),
  removeItem: vi.fn((key) => {
    delete _localStorageData[key];
  }),
  clear: vi.fn(() => {
    Object.keys(_localStorageData).forEach(key => delete _localStorageData[key]);
  }),
  get length() {
    return Object.keys(_localStorageData).length;
  },
};

// Mock sessionStorage similarly
const _sessionStorageData = {};

global.sessionStorage = {
  getItem: vi.fn((key) => _sessionStorageData[key] || null),
  setItem: vi.fn((key, value) => {
    _sessionStorageData[key] = String(value);
  }),
  removeItem: vi.fn((key) => {
    delete _sessionStorageData[key];
  }),
  clear: vi.fn(() => {
    Object.keys(_sessionStorageData).forEach(key => delete _sessionStorageData[key]);
  }),
  get length() {
    return Object.keys(_sessionStorageData).length;
  },
};

// ─── PLATFORM MOCKS ──────────────────────────────────────────────────────────

// Mock Capacitor for testing mobile app detection
global.Capacitor = {
  isNativePlatform: vi.fn().mockReturnValue(false),
  getPlatform: vi.fn().mockReturnValue('web'),
};

// Mock import.meta.env for environment variable testing
if (!import.meta.env) {
  global.import = {
    meta: {
      env: {
        MODE: 'test',
        DEV: false,
        PROD: false,
        VITE_USE_MOCK: 'true',
        VITE_FIREBASE_PROJECT_ID: 'test-project',
      },
    },
  };
}

// ─── GEOLOCATION MOCK ────────────────────────────────────────────────────────

// Mock navigator.geolocation for location-based tests
const mockGeolocationPosition = {
  coords: {
    latitude: 12.9716,
    longitude: 77.5946,
    accuracy: 10,
  },
  timestamp: Date.now(),
};

global.navigator.geolocation = {
  getCurrentPosition: vi.fn((success) => {
    success(mockGeolocationPosition);
  }),
  watchPosition: vi.fn((success) => {
    success(mockGeolocationPosition);
    return 1;
  }),
  clearWatch: vi.fn(),
};

// ─── WORKER MOCK ─────────────────────────────────────────────────────────────

// Mock Web Worker for background tasks
global.Worker = vi.fn(() => ({
  postMessage: vi.fn(),
  terminate: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

// ─── CRYPTO MOCK ─────────────────────────────────────────────────────────────

// Mock crypto for secure random generation
if (!global.crypto) {
  global.crypto = {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  };
}
