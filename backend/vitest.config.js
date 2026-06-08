import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Vitest Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * Test runner setup for Job Genie. Provides unit testing, E2E support,
 * and coverage reporting.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default defineConfig({
  plugins: [react()],
  
  test: {
    // ─── TEST ENVIRONMENT ────────────────────────────────────────────────
    globals: true,  // No need to import describe, it, expect
    environment: 'jsdom',  // Browser-like environment for React testing
    setupFiles: ['./src/tests/setup.js'],  // Global test setup
    
    // ─── COVERAGE SETTINGS ────────────────────────────────────────────────
    coverage: {
      provider: 'v8',  // V8 coverage provider (built-in)
      reporter: ['text', 'html', 'json', 'lcov'],  // Multiple formats
      exclude: [
        'node_modules/',
        'src/tests/',
        'dist/',
        'cypress/',
        '**/*.test.js',
        '**/*.test.jsx',
        '**/mock*.js',
      ],
      lines: 70,       // Coverage threshold
      functions: 70,
      branches: 65,
      statements: 70,
      all: true,       // Include all files, not just tested ones
    },

    // ─── TEST FILE PATTERNS ──────────────────────────────────────────────
    include: [
      'src/**/*.{test,spec}.{js,jsx}',
      'src/tests/**/*.{test,spec}.{js,jsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
    ],

    // ─── TIMEOUT & PERFORMANCE ───────────────────────────────────────────
    testTimeout: 10000,  // 10 seconds per test
    hookTimeout: 10000,  // 10 seconds per hook
    teardownTimeout: 10000,
    isolate: true,  // Run each test in isolation
    
    // ─── REPORTER OPTIONS ────────────────────────────────────────────────
    reporters: ['default', 'html'],  // Console + HTML report
    outputFile: {
      html: './coverage/test-results.html',
    },

    // ─── MOCK RESET ──────────────────────────────────────────────────────
    mockReset: true,  // Reset mocks between tests
    restoreMocks: true,  // Restore all mocks between tests
    clearMocks: true,  // Clear mock calls between tests

    // ─── INCLUDE SOURCE MAPS ─────────────────────────────────────────────
    sourcemap: 'inline',  // Include source maps for debugging

    // ─── ENVIRONMENT VARIABLES ───────────────────────────────────────────
    env: {
      NODE_ENV: 'test',
      VITE_USE_MOCK: 'true',
      VITE_E2E_MODE: 'true',
      VITE_FIREBASE_PROJECT_ID: 'test-project',
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
