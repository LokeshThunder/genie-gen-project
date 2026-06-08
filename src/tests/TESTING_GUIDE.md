# Job Genie Testing Guide

## Overview
This document outlines the testing infrastructure for Job Genie, including test organization, running tests, and adding new tests.

## Test Structure

```
src/tests/
├── setup.js                 # Global test setup & mocks
├── gamification.test.js     # XP levels & progression tests
├── security.test.js         # sanitizeText & rateLimiter tests
├── geofencing.test.js       # Distance calculation & geofence validation
└── TESTING_GUIDE.md         # This file
```

## Test Coverage

### Security Tests (`security.test.js`)
- ✅ **sanitizeText()** - HTML/XSS prevention, character encoding, length enforcement
  - Removes HTML tags and event handlers
  - Prevents javascript: protocol attacks
  - Encodes special characters for safe display
  - Enforces max length constraints (default 200 chars)
  - Handles edge cases (non-string input, whitespace collapse)

- ✅ **rateLimiter.check()** - Sliding window rate limiting
  - Allows calls within rate limits
  - Blocks calls exceeding limits
  - Resets after time window expires
  - Maintains separate limits per key

### Gamification Tests (`gamification.test.js`)
- ✅ **calculateLevel(xp)** - XP to level conversion
  - Correct level mapping for all 10 levels (Beginner → Genie Prime)
  - Proper bonus multipliers (1.0x → 5.0x)
  - Edge cases (0 XP, max XP)

- ✅ **getProgressToNextLevel(xp)** - Progress bar calculation
  - 0% at level start, 100% at level threshold
  - ~50% at halfway point
  - Clamps between 0-100%
  - Max level returns 100%

### Geofencing Tests (`geofencing.test.js`)
- ✅ **calcDistance(lat1, lng1, lat2, lng2)** - Haversine distance formula
  - Returns 0 for identical coordinates
  - Calculates known distances correctly
  - Works across hemispheres and date line
  - Edge cases (poles, zero coordinates)

- ✅ **Geofence validation** - 500m radius enforcement
  - Allows check-in within 500m
  - Rejects check-in beyond 500m
  - Validates boundary conditions
  - Tests from multiple angles

## Running Tests

### Run all tests once
```bash
npm run test:run
```

### Run tests in watch mode (development)
```bash
npm run test
```

### Run tests with UI (visual dashboard)
```bash
npm run test:ui
```

### Run tests with coverage report
```bash
npm run test:coverage
```

Coverage reports are generated in:
- Console output (summary)
- `coverage/` directory (HTML report)
- JSON format for CI/CD integration

## Writing New Tests

### Test File Template
```javascript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { functionToTest } from '../path/to/module';

describe('Feature or Module Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it('should do something specific', () => {
    const result = functionToTest(input);
    expect(result).toBe(expectedValue);
  });

  it('should handle edge case', () => {
    const result = functionToTest(edgeCase);
    expect(result).toThrow(Error);
  });
});
```

### Common Assertions

```javascript
// Value matching
expect(value).toBe(expected);           // Strict equality
expect(value).toEqual(expected);        // Deep equality
expect(value).toMatch(/pattern/);       // Regex matching

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Numbers
expect(value).toBeGreaterThan(5);
expect(value).toBeLessThan(10);
expect(value).toBeCloseTo(3.14, 2);    // Within 2 decimal places

// Arrays & Objects
expect(array).toContain(item);
expect(object).toHaveProperty('key');

// Errors
expect(fn).toThrow();
expect(fn).toThrow(ErrorType);

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();
```

### Mocking Examples

```javascript
import { vi } from 'vitest';

// Mock a function
const mockFn = vi.fn();
mockFn.mockReturnValue(42);
mockFn.mockResolvedValue(asyncValue);

// Mock a module
vi.mock('../services/firebaseConfig', () => ({
  db: { /* mock object */ }
}));

// Spy on a method
vi.spyOn(Object, 'method').mockImplementation(() => {});

// Fake timers
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.runAllTimers();
vi.useRealTimers();
```

## Test Setup (`setup.js`)

Global mocks and configurations:
- `@testing-library/react` cleanup after each test
- `window.matchMedia()` for responsive design tests
- `localStorage` mock (in-memory storage)
- `Capacitor` mock (native platform detection)

## Security Testing Notes

1. **XSS Prevention**: All user-supplied text (names, job titles, etc.) must pass through `sanitizeText()` before storage or display.
2. **Rate Limiting**: Application submissions, reviews, and other user actions are rate-limited to 3 per 60 seconds.
3. **Geofencing**: Check-in validation enforces 500m radius around job site GPS coordinates.
4. **Role Validation**: Clients cannot escalate their own role to admin/super_admin (server-side enforcement in Firestore Rules).

## CI/CD Integration

Tests run automatically in GitHub Actions via `.github/workflows/build-and-test.yml`:
```bash
npm run test:run    # Run all tests once
npm run lint        # Run linter
npm run build       # Build production bundle
```

## Troubleshooting

### Tests won't run
- Ensure `node_modules` is installed: `npm install`
- Clear cache: `npx vitest --clearCache`
- Check for syntax errors in test files

### Memory issues during coverage
- Run coverage separately: `npm run test:coverage`
- Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run test:coverage`

### Flaky tests (intermittent failures)
- Avoid hardcoded timeouts; use `vi.useFakeTimers()` for time-dependent tests
- Ensure async operations complete before assertions
- Use `beforeEach`/`afterEach` for consistent state

## Future Test Additions

Recommended areas for additional tests:
- [ ] E2E tests with Cypress (job application flow, check-in process)
- [ ] Component tests with @testing-library/react (UI component behavior)
- [ ] Firebase integration tests (real Firestore with emulator)
- [ ] AI service tests (Gemini API mocking)
- [ ] Localization tests (translation key coverage)
- [ ] Accessibility tests (a11y compliance)
