# 👨‍💻 Job Genie Developer Handbook — Complete Technical Reference

**Version**: 2.0  
**Date**: June 3, 2026  
**Audience**: Developers, Contributors, Technical Leads  
**Status**: Production Ready  

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Development Setup](#development-setup)
4. [Code Organization](#code-organization)
5. [Testing Guide](#testing-guide)
6. [Coding Standards](#coding-standards)
7. [Common Tasks](#common-tasks)
8. [Performance Tips](#performance-tips)
9. [Debugging Guide](#debugging-guide)
10. [Security Checklist](#security-checklist)

---

## Quick Start

### Get Up & Running in 5 Minutes

```bash
# 1. Clone repository
git clone https://github.com/jobgenie/app.git
cd app

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env and add your API keys

# 4. Start development
npm run dev
# Open http://localhost:5173

# 5. Run tests
npm run test
```

### Key Commands You'll Use Daily

```bash
npm run dev          # Start dev server (hot reload)
npm run build        # Build for production
npm run test         # Run tests in watch mode
npm run lint         # Check code quality
npm run lint:fix     # Auto-fix linting issues
npm run test:ui      # Open test dashboard
npm run analyze      # Analyze bundle size
```

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              Job Genie Platform                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │          Frontend (React 19)             │  │
│  │  ┌─────────────────────────────────────┐ │  │
│  │  │  App.jsx (Root)                     │ │  │
│  │  │  ├─ 32 Screens (Lazy loaded)       │ │  │
│  │  │  │  ├─ Worker Screens (11)         │ │  │
│  │  │  │  ├─ Admin Screens (8)           │ │  │
│  │  │  │  └─ Auth/Common (2)             │ │  │
│  │  │  ├─ Components (Reusable)          │ │  │
│  │  │  ├─ Services (Backend logic)       │ │  │
│  │  │  └─ Constants (Static data)        │ │  │
│  │  └─────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────┘  │
│                    ↓↓↓                         │
│  ┌─────────────────────────────────────────┐  │
│  │         Capacitor (Mobile Bridge)       │  │
│  │  ├─ Firebase Auth (Native)              │  │
│  │  ├─ Geolocation                         │  │
│  │  ├─ Camera/QR Scanner                   │  │
│  │  ├─ File System                         │  │
│  │  └─ Push Notifications                  │  │
│  └─────────────────────────────────────────┘  │
│                    ↓↓↓                         │
│  ┌─────────────────────────────────────────┐  │
│  │           Firebase Backend              │  │
│  │  ├─ Firestore Database                  │  │
│  │  ├─ Authentication                      │  │
│  │  ├─ Hosting & CDN                       │  │
│  │  └─ Cloud Functions (if needed)         │  │
│  └─────────────────────────────────────────┘  │
│                    ↓↓↓                         │
│  ┌─────────────────────────────────────────┐  │
│  │         External APIs                   │  │
│  │  ├─ Google Gemini (AI)                  │  │
│  │  ├─ Google Maps (Geofencing)            │  │
│  │  └─ Payment Gateway (if needed)         │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
USER INTERACTION
    ↓
Screen Component renders UI
    ↓
User triggers action (click, input, etc.)
    ↓
Service method called
    (aiService, jobService, firestoreService, etc.)
    ↓
Firestore / External API called
    ↓
Mock Firestore or Real Firestore (based on env)
    ↓
Response processed
    ↓
State updated (React)
    ↓
Component re-renders with new data
```

---

## Development Setup

### Prerequisites

```
✅ Node.js v18+ (check: node --version)
✅ npm v9+ (check: npm --version)
✅ Git (check: git --version)
✅ Firebase CLI (npm install -g firebase-tools)
```

### Environment Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/jobgenie/app.git
cd app
```

#### 2. Install Dependencies
```bash
npm install
# This installs all packages from package.json
```

#### 3. Set Up Environment Variables

```bash
# Copy example to local .env
cp .env.example .env

# Edit .env and add your keys:
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_GOOGLE_WEB_CLIENT_ID=...
VITE_GEMINI_API_KEY=...
```

#### 4. Start Development Server
```bash
npm run dev
# App will be at http://localhost:5173
```

#### 5. (Optional) Use Firebase Emulator

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Start emulator
firebase emulators:start

# In .env, add:
VITE_USE_FIREBASE_EMULATOR=true
VITE_FIREBASE_EMULATOR_HOST=localhost
```

### IDE Setup

#### VS Code Extensions (Recommended)

```
1. ES7+ React/Redux/React-Native snippets
   └─ dsznajder.es7-react-js-snippets

2. Prettier - Code formatter
   └─ esbenp.prettier-vscode

3. ESLint
   └─ dbaeumer.vscode-eslint

4. Firebase
   └─ toba.vsfire

5. Vitest
   └─ vitest.explorer

6. Debugger for Chrome
   └─ msjsdiag.debugger-for-chrome
```

#### VS Code Settings

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## Code Organization

### Directory Structure (Detailed)

```
src/
├── App.jsx                      # Root component with auth & routing
├── main.jsx                     # React entry point
├── index.css                    # Global styles & CSS variables
├── App.css                      # App-level styles
│
├── screens/                     # Full-page screen components (32 files)
│   ├── LoginScreen.jsx
│   ├── HomeScreen.jsx
│   ├── FindGigScreen.jsx
│   ├── AttendanceScreen.jsx
│   ├── AdminDashboard.jsx
│   └── ... (28 more screens)
│
├── components/                  # Reusable UI components
│   ├── NavBar.jsx              # Bottom tab navigation
│   ├── LoadingScreen.jsx
│   ├── ErrorBoundary.jsx
│   ├── AccessibleModal.jsx     # Accessibility wrapper
│   ├── LoadingButton.jsx        # Button with loading state
│   ├── InputError.jsx           # Error message component
│   ├── EmptyState.jsx           # Empty state placeholder
│   ├── AIChatbot.jsx            # Chat UI component
│   ├── GenieActionBar.jsx       # Floating action bar
│   ├── GenieVoiceAssistant.jsx  # Voice input overlay
│   ├── TutorialModal.jsx        # Onboarding tips
│   ├── RatingModal.jsx          # Post-job rating
│   ├── QRScannerModal.jsx       # QR code scanner
│   ├── Galaxy.jsx               # 3D background effect
│   └── ... (more components)
│
├── services/                    # Backend logic & API calls
│   ├── firebaseConfig.js        # Firebase initialization
│   ├── firestoreService.js      # Firestore CRUD operations
│   ├── mockFirestore.js         # Mock data for development
│   ├── authService.js           # Authentication helpers
│   ├── aiService.js             # Gemini AI integration
│   ├── jobService.js            # Job-specific logic
│   ├── notificationService.js
│   ├── hapticService.js
│   ├── heartbeatService.js
│   ├── exportService.js         # PDF/CSV export
│   ├── operationalService.js
│   ├── knowledgeService.js
│   └── securityService.js       # Security helpers
│
├── constants/                   # Static data & configuration
│   ├── translations.js          # All UI strings (11 languages)
│   ├── gamification.js          # XP levels, badges, skill paths
│   ├── jobConstants.js          # Job types, categories, statuses
│   └── definitions.js           # Enums & constants
│
├── utils/                       # Pure utility functions
│   ├── helpers.js               # Common utilities
│   ├── validators.js            # Input validation
│   ├── formatters.js            # Data formatting
│   └── geofencing.js            # Geofence calculations
│
└── tests/                       # Test files & utilities
    ├── setup.js                 # Global test setup
    ├── testUtils.js             # Factory functions & helpers
    ├── gamification.test.js
    ├── security.test.js
    ├── geofencing.test.js
    ├── TESTING_GUIDE.md         # How to write tests
    └── E2E_SETUP.md             # Cypress configuration
```

### Naming Conventions

#### Files
```
Components:     PascalCase       HomeScreen.jsx, NavBar.jsx
Services:       camelCase        firestoreService.js, aiService.js
Utilities:      camelCase        helpers.js, validators.js
Constants:      camelCase        gamification.js, jobConstants.js
Tests:          *.test.js        gamification.test.js
Styles:         *.css or *.scss  App.css, NavBar.css
```

#### Variables & Functions
```
Components:     PascalCase       function HomeScreen() {}
Functions:      camelCase        function calculateLevel() {}
Constants:      UPPER_CASE       const XP_LEVELS = {}
Variables:      camelCase        let currentUser = {}
Private:        _underscore      let _privateVar = {}
Boolean:        isX / hasX       let isLoading = false
```

#### React Components Props
```
Standard Props:
  children      // Content to render
  className     // CSS class names
  style         // Inline styles
  onClick       // Click handler
  onChange      // Input change handler
  onSubmit      // Form submission

Custom Props:
  t             // Translations object
  currentLang   // Current language
  setActive     // Navigation function
  screenParams  // Passed parameters
```

---

## Testing Guide

### Test Types

#### Unit Tests
```javascript
// Test: Individual functions in isolation
import { calculateLevel } from '../gamification';

describe('calculateLevel', () => {
  it('returns correct level for total XP', () => {
    expect(calculateLevel(500)).toBe(3);
    expect(calculateLevel(1500)).toBe(5);
  });
});
```

#### Component Tests
```javascript
// Test: React component rendering and interaction
import { render, screen } from '@testing-library/react';
import { HomeScreen } from '../screens/HomeScreen';

describe('HomeScreen', () => {
  it('renders user earnings', () => {
    render(<HomeScreen t={translations.en} />);
    expect(screen.getByText(/earnings/i)).toBeInTheDocument();
  });
});
```

#### Integration Tests
```javascript
// Test: Multiple components working together
// (E2E tests via Cypress for full workflows)
```

#### E2E Tests
```javascript
// Test: Full user workflows
describe('Authentication Flow', () => {
  it('allows user to login with Google', () => {
    cy.visit('/');
    cy.contains('Login with Google').click();
    // ... continue workflow
  });
});
```

### Running Tests

```bash
# Watch mode (re-runs on changes)
npm run test

# Single run (for CI/CD)
npm run test:run

# With coverage report
npm run test:coverage

# View test dashboard
npm run test:ui

# Run specific test file
npm run test -- gamification.test.js

# Run tests matching pattern
npm run test -- --grep "calculateLevel"
```

### Writing Your First Test

```javascript
// 1. Create file: src/tests/myFeature.test.js
import { describe, it, expect } from 'vitest';
import { myFunction } from '../services/myService';

// 2. Group related tests
describe('myFunction', () => {
  
  // 3. Write individual test
  it('should return expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
  
  // 4. Test edge cases
  it('should handle empty input', () => {
    const result = myFunction('');
    expect(result).toBeDefined();
  });
});
```

### Testing Best Practices

```
✅ DO:
  - Test behavior, not implementation
  - Write clear test descriptions
  - Test edge cases and error states
  - Keep tests focused (one thing per test)
  - Use descriptive variable names
  - Mock external services
  - Group related tests with describe()
  - Make tests deterministic (no randomness)

❌ DON'T:
  - Test internal state
  - Use vague test descriptions
  - Test multiple things in one test
  - Hard-code magic numbers
  - Depend on test order
  - Leave console.log() statements
  - Make network calls in tests
  - Use real timers (use fake timers)
```

---

## Coding Standards

### Code Style

#### Formatting (Prettier)
```bash
# Auto-format all files
npm run lint:fix

# Check files without modifying
npm run lint
```

#### JavaScript Standards
```javascript
// ✅ Use const by default, let if reassignment needed
const API_KEY = 'abc123';
let counter = 0;

// ✅ Use arrow functions for callbacks
const items = data.map(item => item.name);

// ✅ Destructuring for clarity
const { name, email } = user;
const [first, ...rest] = array;

// ✅ Template strings for interpolation
const message = `Hello, ${name}!`;

// ❌ Avoid var
var x = 5;  // Don't do this

// ❌ Avoid if possible
const x = condition ? true : false;  // Use condition directly
```

#### React Standards
```javascript
// ✅ Use functional components with hooks
function MyComponent() {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Side effect
  }, []);
  
  return <div>Content</div>;
}

// ✅ Prop drilling with t and currentLang
function Screen({ t, currentLang, setActive, screenParams }) {
  return (
    <div>
      <h1>{t.screen_title || 'Title'}</h1>
    </div>
  );
}

// ✅ Lazy load screens for code splitting
const HomeScreen = lazy(() => import('./screens/HomeScreen'));

// ❌ Avoid class components (unless ErrorBoundary)
class MyComponent extends React.Component {}
```

#### Error Handling
```javascript
// ✅ Always handle errors
try {
  const result = await firestoreService.getJobs();
  setJobs(result);
} catch (error) {
  console.error('Failed to fetch jobs:', error);
  setError(t.error_load_failed || 'Failed to load jobs');
}

// ✅ Provide user-friendly error messages
setError(t.error_geofence_violation || 'You are outside the work area');

// ❌ Don't silently fail
firestoreService.getJobs().then(jobs => setJobs(jobs));
// What if it fails? No error handling!
```

#### Accessibility Standards
```javascript
// ✅ Add semantic HTML
<button onClick={handleClick}>{t.submit || 'Submit'}</button>

// ✅ Include ARIA labels
<button aria-label={t.close_modal || 'Close'}>×</button>

// ✅ Use proper heading hierarchy
<h1>{t.page_title}</h1>
<h2>{t.section_title}</h2>

// ❌ Don't use divs for buttons
<div onClick={handleClick}>{t.submit}</div>

// ❌ Don't forget alt text
<img src="icon.png" alt={t.job_icon || 'Job icon'} />
```

### Comments & Documentation

```javascript
// ✅ Comment WHY, not WHAT
// Workers can only check in within 500m of job location
if (calcDistance(worker, job) > 500) {
  throw new Error('Outside geofence');
}

// ✅ Document complex functions
/**
 * Calculate XP level from total experience points
 * @param {number} totalXP - Total experience points earned
 * @returns {number} Level (1-10)
 */
function calculateLevel(totalXP) {
  // Implementation
}

// ❌ Don't comment obvious code
const name = user.name; // Set name to user.name

// ❌ Don't leave debugging comments
console.log('DEBUG:', error); // Remove before committing
```

### Commit Messages

```
// ✅ Good commit messages
git commit -m "Fix: prevent WorkerAIScreen import error

- Fixed syntax error in translations.js line 958
- Added missing 'go_to' translation key
- Verified all 15 keys present in all 11 languages
- Resolves issue #123"

// ✅ Commit message format
[type]: [subject]

[optional body]

[optional footer]

Types:
  feat:     New feature
  fix:      Bug fix
  refactor: Code reorganization
  docs:     Documentation only
  test:     Tests only
  chore:    Build, dependencies, etc.
```

---

## Common Tasks

### Adding a New Screen

```javascript
// 1. Create file: src/screens/MyNewScreen.jsx
function MyNewScreen({ t, currentLang, setActive, screenParams }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const result = await firestoreService.getData();
      setData(result);
    } catch (err) {
      setError(t.error_load_failed || 'Failed to load');
    }
  };
  
  if (error) return <div>{error}</div>;
  if (!data) return <LoadingScreen />;
  
  return (
    <div>
      <h1>{t.my_screen_title || 'Title'}</h1>
      {/* Content */}
    </div>
  );
}

export default MyNewScreen;

// 2. Add to App.jsx
const MyNewScreen = lazy(() => import('./screens/MyNewScreen'));

// 3. Add to screen switch
case 'myNewScreen':
  return <MyNewScreen {...props} />;

// 4. Add to NavBar if needed
// navItems.push({ id: 'myNewScreen', label: t.my_screen_label })

// 5. Add translations
// src/constants/translations.js
"my_screen_title": "My Screen Title"
"my_screen_label": "My Screen"
```

### Adding a New Feature

```javascript
// 1. Create service: src/services/myFeatureService.js
export const myFeatureService = {
  async getData() {
    // Implement
  },
};

// 2. Add error handling
export const myFeatureService = {
  async getData() {
    try {
      // Firestore call
      return result;
    } catch (error) {
      console.error('Failed to get data:', error);
      throw new Error('data_load_failed');
    }
  },
};

// 3. Use in component
import { myFeatureService } from '../services/myFeatureService';

function Component() {
  useEffect(() => {
    myFeatureService.getData()
      .then(data => setData(data))
      .catch(err => setError(t[err.message] || 'Unknown error'));
  }, []);
}

// 4. Add tests
// src/tests/myFeature.test.js
describe('myFeatureService', () => {
  it('should getData', async () => {
    const data = await myFeatureService.getData();
    expect(data).toBeDefined();
  });
});

// 5. Add translations
"my_feature_title": "My Feature Title"
"error_data_load_failed": "Failed to load data"
```

### Fixing a Bug

```
1. Reproduce locally
   npm run dev
   Navigate to screen
   Trigger error
   Check console

2. Identify root cause
   - Read error stack trace
   - Check Sentry for details
   - Add console.log() to debug

3. Write test that fails
   npm run test
   Verify test fails with error

4. Fix the code
   Make minimal changes
   Test locally
   Run test (should pass now)

5. Verify fix
   npm run lint           # No linting errors
   npm run test:run       # All tests pass
   npm run build:prod     # Builds successfully

6. Commit and push
   git add .
   git commit -m "Fix: [description]"
   git push origin branch

7. Monitor production
   firebase deploy ...
   Check Sentry after deploy
```

### Debugging Tips

```javascript
// Use console for debugging
console.log('User:', user);
console.table(items);
console.error('Error:', error);

// Use debugger statement
debugger; // Opens DevTools when line is hit

// Use React DevTools
// DevTools tab → Components → Inspect
// See props, state, hooks

// Use Vitest UI
npm run test:ui
// Watch tests run, see coverage

// Check Network tab
// DevTools → Network
// See API calls, status codes, response data

// Check Application storage
// DevTools → Application
// See localStorage, sessionStorage, cookies

// Use Firestore Emulator
firebase emulators:start
# Inspect data in browser at localhost:4000
```

---

## Performance Tips

### Component Performance

```javascript
// ✅ Use memo for expensive components
const ExpensiveComponent = memo(function Component({ data }) {
  // Only re-renders if data prop changes
  return <div>{data}</div>;
});

// ✅ Use useCallback for stable functions
function Parent() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <Child onClick={handleClick} />;
}

// ✅ Lazy load screens
const HomeScreen = lazy(() => import('./screens/HomeScreen'));
<Suspense fallback={<LoadingScreen />}>
  <HomeScreen />
</Suspense>

// ❌ Don't create functions in render
function Parent() {
  return <Child onClick={() => {}} />; // New function every render
}
```

### Bundle Size

```bash
# Analyze bundle
npm run analyze

# Look for:
  - Large dependencies
  - Unused code
  - Duplicate libraries

# Solutions:
  - Use dynamic imports (lazy loading)
  - Remove unused dependencies
  - Use smaller alternatives
```

### Database Performance

```javascript
// ✅ Query only what you need
const jobs = await firestoreService.getJobs(); // With where() clause

// ✅ Use pagination for large datasets
const firstPage = await firestoreService.getJobs({ limit: 20 });

// ✅ Use listeners for real-time updates (efficient)
firestoreService.onJobsChange(callback);

// ❌ Don't fetch all data
const allJobs = await firestoreService.getAllJobs(); // Too slow
```

---

## Debugging Guide

### Browser DevTools

```
F12 Opens DevTools

Console tab:
  - See console.log() output
  - Execute JavaScript
  - View errors

Sources tab:
  - Set breakpoints
  - Step through code
  - Watch variables

Network tab:
  - Monitor API calls
  - Check response status
  - See request headers

Application tab:
  - View localStorage
  - Check cookies
  - See service worker
```

### React DevTools

```
Install: React Developer Tools extension

Features:
  - Inspect components
  - See props & state
  - Trigger hooks
  - Track renders
```

### Sentry Error Tracking

```
Real production errors logged

Access: https://sentry.io/organizations/job-genie

See:
  - Error stack trace
  - User information
  - Browser details
  - Request data
```

### Firebase Console

```
Access: https://console.firebase.google.com

Check:
  - Firestore database (data)
  - Authentication (users)
  - Hosting (deployments)
  - Functions (logs)
  - Analytics (usage)
```

---

## Security Checklist

### Before Committing

```
Code Security:
  ☐ No console.log() with sensitive data
  ☐ No hardcoded API keys
  ☐ No passwords in comments
  ☐ Input properly sanitized
  ☐ SQL/NoSQL injection prevented

Dependency Security:
  ☐ No unused dependencies
  ☐ npm audit passes (npm audit)
  ☐ No known vulnerabilities
  ☐ Lock file committed (package-lock.json)

Testing:
  ☐ Tests pass (npm run test:run)
  ☐ Coverage maintained (70%+)
  ☐ New tests for new features
  ☐ Error cases tested

Documentation:
  ☐ Code commented where needed
  ☐ Functions documented
  ☐ Edge cases noted
  ☐ Complex logic explained
```

### Before Deploying

```
Production Safety:
  ☐ VITE_USE_MOCK=false in .env.production
  ☐ No mock data in production build
  ☐ All secrets in GitHub Secrets
  ☐ Firestore rules reviewed
  ☐ Authentication verified

Performance:
  ☐ Bundle size acceptable (<500KB)
  ☐ No console.log() (removed in prod)
  ☐ Source maps disabled (prod)
  ☐ Assets optimized (images, CSS)

Monitoring:
  ☐ Sentry configured
  ☐ Analytics enabled
  ☐ Error tracking active
  ☐ Performance monitoring on

Testing:
  ☐ All tests passing
  ☐ Manual testing on production build
  ☐ E2E tests passing (if available)
  ☐ No known bugs
```

---

## Additional Resources

### Documentation Files
- `README.md` — Project overview
- `TESTING_GUIDE.md` — Testing reference
- `E2E_SETUP.md` — Cypress configuration
- `.kiro/audit-report.md` — Original audit

### External Resources
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Web Accessibility (WCAG)](https://www.w3.org/WAI/WCAG21/quickref)

### Community & Support

```
Slack: #job-genie-dev
Email: devs@jobgenie.com
Issues: GitHub Issues
Docs: https://docs.jobgenie.com
```

---

## Troubleshooting Common Issues

### "Cannot find module"
```
Solution:
1. Check file exists: ls src/path/to/file.js
2. Check import path is correct
3. Clear cache: rm -rf node_modules && npm install
4. Restart dev server
```

### "Syntax error in translations.js"
```
Solution:
1. Check line numbers in error
2. Look for: missing quotes, extra commas
3. Verify JSON syntax is valid
4. Use JSON validator: jsonlint.com
5. Restart dev server
```

### "Tests failing"
```
Solution:
1. Run specific test: npm run test -- filename.test.js
2. Check error message
3. Verify test expectations
4. Mock external services
5. Check setup.js for mocks
```

### "Bundle too large"
```
Solution:
1. Analyze: npm run analyze
2. Identify large modules
3. Check for:
   - Unused dependencies
   - Duplicate libraries
   - Large assets
4. Consider lazy loading
5. Split code by feature
```

---

## Sign-Off

```
╔════════════════════════════════════════════════════════╗
║         DEVELOPER HANDBOOK — COMPLETE                  ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  Status:     ✅ Production Ready                       ║
║  Version:    2.0                                       ║
║  Updated:    June 3, 2026                             ║
║  Coverage:   All development tasks                    ║
║                                                        ║
║  Ready to:                                             ║
║  ✅ Onboard new developers                           ║
║  ✅ Maintain codebase                                ║
║  ✅ Add new features                                 ║
║  ✅ Debug issues                                     ║
║  ✅ Write tests                                      ║
║  ✅ Optimize performance                             ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

**Welcome to the Job Genie development team!** 🚀

