# E2E Testing with Cypress — Setup Guide

## Overview

End-to-End (E2E) testing simulates real user workflows across the entire application. Cypress provides a browser-based testing framework ideal for testing Job Genie's UI interactions, navigation, and data flows.

## Installation

Cypress is optional and recommended for integration testing workflows. To set up:

```bash
npm install --save-dev cypress
```

This adds Cypress to `devDependencies` and enables the E2E test commands:
- `npm run e2e` — Opens Cypress Test Runner (interactive)
- `npm run e2e:run` — Runs E2E tests in headless mode (CI/CD)

## Project Structure

Once installed, Cypress will create:

```
cypress/
├── e2e/                    # E2E test specs
│   ├── auth.cy.js          # Authentication flows
│   ├── worker-flow.cy.js    # Worker job application flow
│   ├── admin-flow.cy.js     # Admin job posting flow
│   └── geofencing.cy.js     # Geofence check-in validation
├── fixtures/               # Test data (mock responses)
├── support/
│   ├── commands.js         # Custom Cypress commands
│   └── e2e.js              # Global hooks & config
└── cypress.config.js       # Cypress configuration
```

## Configuration

Create `cypress.config.js` at project root:

```javascript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // Vite dev server
    viewportWidth: 375,
    viewportHeight: 812,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    setupNodeEvents(on, config) {
      // Implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
```

## Custom Commands

Create `cypress/support/commands.js` for reusable test utilities:

```javascript
// Mock login as worker
Cypress.Commands.add('loginAsWorker', (email = 'worker@test.com') => {
  cy.visit('/');
  cy.contains('Sign in with Google').click();
  // Mock the OAuth flow or use test credentials
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="login-submit"]').click();
  cy.url().should('include', '/home');
});

// Mock login as admin
Cypress.Commands.add('loginAsAdmin', (email = 'admin@test.com') => {
  cy.visit('/');
  cy.contains('Sign in with Google').click();
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="login-submit"]').click();
  cy.url().should('include', '/admin-dashboard');
});

// Navigate to specific tab
Cypress.Commands.add('navigateToTab', (tabName) => {
  cy.get(`[data-testid="nav-${tabName}"]`).click();
});

// Apply to a job
Cypress.Commands.add('applyToJob', (jobTitle) => {
  cy.contains(jobTitle).click();
  cy.get('[data-testid="apply-button"]').click();
  cy.contains('Applied').should('be.visible');
});
```

## Test Examples

### Authentication E2E Test

```javascript
describe('Authentication Flow', () => {
  it('should allow worker to sign in and access home screen', () => {
    cy.visit('/');
    cy.contains('Sign in with Google').should('be.visible');
    
    // Mock Google Auth
    cy.loginAsWorker();
    
    cy.url().should('include', '/home');
    cy.contains('Welcome').should('be.visible');
  });

  it('should allow admin to access dashboard', () => {
    cy.loginAsAdmin();
    cy.url().should('include', '/admin-dashboard');
    cy.contains('Manage Jobs').should('be.visible');
  });

  it('should prevent unauthorized access to admin pages', () => {
    cy.loginAsWorker();
    cy.visit('/admin-dashboard');
    cy.url().should('not.include', '/admin-dashboard');
  });
});
```

### Worker Job Application Flow

```javascript
describe('Worker Job Application', () => {
  beforeEach(() => {
    cy.loginAsWorker();
    cy.navigateToTab('find-gig');
  });

  it('should browse and apply to jobs', () => {
    cy.get('[data-testid="job-card"]').should('have.length.greaterThan', 0);
    
    // Click first job
    cy.get('[data-testid="job-card"]').first().click();
    
    // Verify job details
    cy.get('[data-testid="job-title"]').should('be.visible');
    cy.get('[data-testid="job-pay"]').should('contain', '₹');
    
    // Apply
    cy.applyToJob(cy.contains('Apply'));
  });

  it('should show applied jobs in My Jobs', () => {
    // Apply to a job
    cy.applyToJob('Test Warehouse Job');
    
    // Navigate to My Jobs
    cy.navigateToTab('my-jobs');
    
    // Verify job appears in applied list
    cy.contains('Test Warehouse Job').should('be.visible');
    cy.contains('Pending').should('be.visible');
  });
});
```

### Admin Job Posting Flow

```javascript
describe('Admin Job Posting', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('should allow admin to post a new job', () => {
    cy.get('[data-testid="create-job-button"]').click();
    
    cy.get('[data-testid="job-title-input"]').type('Senior Warehouse Staff');
    cy.get('[data-testid="category-select"]').select('Warehousing');
    cy.get('[data-testid="pay-input"]').type('600');
    cy.get('[data-testid="location-input"]').type('Bangalore');
    cy.get('[data-testid="description-input"]').type('Urgent: 10 workers needed');
    
    cy.get('[data-testid="post-job-submit"]').click();
    
    cy.contains('Job posted successfully').should('be.visible');
  });

  it('should show posted jobs on admin dashboard', () => {
    cy.get('[data-testid="admin-jobs-tab"]').click();
    cy.contains('Senior Warehouse Staff').should('be.visible');
    cy.contains('Live').should('be.visible');
  });
});
```

### Geofencing Check-In E2E Test

```javascript
describe('Geofence Check-In', () => {
  beforeEach(() => {
    cy.loginAsWorker();
    cy.navigateToTab('attendance');
  });

  it('should allow check-in within geofence radius', () => {
    // Mock geolocation within 500m
    cy.window().then(win => {
      cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake(success => {
        success({
          coords: {
            latitude: 12.9716,
            longitude: 77.5946,
            accuracy: 10,
          },
        });
      });
    });

    cy.get('[data-testid="check-in-button"]').click();
    cy.contains('Checked In').should('be.visible');
  });

  it('should reject check-in beyond geofence radius', () => {
    // Mock geolocation outside 500m
    cy.window().then(win => {
      cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake(success => {
        success({
          coords: {
            latitude: 12.9, // ~8km away
            longitude: 77.5,
            accuracy: 10,
          },
        });
      });
    });

    cy.get('[data-testid="check-in-button"]').click();
    cy.contains('You are outside the job location').should('be.visible');
  });
});
```

## Fixtures (Mock Data)

Create `cypress/fixtures/jobs.json`:

```json
{
  "jobs": [
    {
      "id": "job-1",
      "title": "Warehouse Packers",
      "category": "Warehousing",
      "pay": 500,
      "location": "Bangalore",
      "status": "Live"
    },
    {
      "id": "job-2",
      "title": "Delivery Drivers",
      "category": "Delivery",
      "pay": 600,
      "location": "Bangalore",
      "status": "Live"
    }
  ]
}
```

Use in tests:
```javascript
cy.fixture('jobs').then(jobs => {
  cy.intercept('GET', '/api/jobs', jobs);
});
```

## Running E2E Tests

### Interactive Mode (Development)
```bash
npm run e2e
```
Opens Cypress Test Runner with browser visualization.

### Headless Mode (CI/CD)
```bash
npm run e2e:run
```
Runs all tests in background, outputs results to console.

### Run Specific Test
```bash
npx cypress run --spec "cypress/e2e/auth.cy.js"
```

### Debug Mode
```bash
npx cypress run --debug
```

## Best Practices

1. **Use data-testid attributes** for reliable element selection:
   ```jsx
   <button data-testid="apply-button">Apply</button>
   ```

2. **Mock external APIs** to keep tests fast and deterministic:
   ```javascript
   cy.intercept('POST', '/api/apply', { id: 'app-1' });
   ```

3. **Keep tests isolated** — each test should be independent:
   ```javascript
   beforeEach(() => {
     cy.loginAsWorker(); // Reset state before each test
   });
   ```

4. **Use custom commands** to reduce boilerplate:
   ```javascript
   cy.loginAsWorker(); // Instead of repeating login steps
   ```

5. **Test user flows, not implementation details**:
   ```javascript
   // ✅ Good: Test the workflow
   cy.contains('Apply').click();
   cy.contains('Applied').should('be.visible');

   // ❌ Bad: Test internal state
   cy.get('.react-component-state').should('have.state', 'applied');
   ```

## CI/CD Integration

Add to `.github/workflows/build-and-test.yml`:

```yaml
- name: Run E2E Tests
  run: npm run e2e:run
  
- name: Upload Cypress Videos
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: cypress-videos
    path: cypress/videos
```

## Troubleshooting

### Tests timeout
- Increase `defaultCommandTimeout` in `cypress.config.js`
- Check that dev server is running: `npm run dev`

### Elements not found
- Add `data-testid` attributes to elements
- Use `cy.contains()` for text-based selection
- Verify element is in viewport

### Geolocation not working
- Mock using `cy.stub(navigator.geolocation, 'getCurrentPosition')`
- Use Cypress geolocation plugin for real location testing

### Screenshots/Videos
- Automatically saved on failure in `cypress/screenshots/` and `cypress/videos/`
- Configure recording options in `cypress.config.js`

## Additional Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Testing Library Integration](https://docs.cypress.io/guides/component-testing/introduction)
