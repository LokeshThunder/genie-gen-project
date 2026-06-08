# Job Genie — Gig Worker Platform

A mobile-first web app connecting blue-collar workers with short-term industrial jobs across Indian cities, built with React 19, Capacitor, and Firebase.

**Status**: ✅ Production-Ready  
**Latest Build**: [![Build Status](https://github.com/yourusername/job-genie/workflows/Build%2C%20Test%20%26%20Deploy/badge.svg)](https://github.com/yourusername/job-genie/actions)  
**Coverage**: [![codecov](https://codecov.io/gh/yourusername/job-genie/branch/main/graph/badge.svg)](https://codecov.io/gh/yourusername/job-genie)

---

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Quick Start

### Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm 9+** (included with Node.js)
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Android Studio** (for Android development)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/job-genie.git
   cd job-genie
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build:prod
   ```

---

## Project Structure

```
job-genie/
├── src/
│   ├── screens/              # 25 full-page components (role-based)
│   ├── components/           # Reusable UI components + 3D effects
│   ├── services/             # Backend/API logic (Firebase, AI, auth)
│   ├── constants/            # Gamification, translations, configs
│   ├── hooks/                # Custom React hooks
│   ├── tests/                # Unit & integration tests
│   ├── utils/                # Utility functions
│   ├── App.jsx               # Root component
│   ├── main.jsx              # React entry point
│   ├── index.css             # Global styles
│   └── App.css               # App-level styles
│
├── android/                  # Capacitor Android project (generated)
├── cypress/                  # E2E tests with Cypress
├── dist/                     # Production build output
├── public/                   # Static assets
├── .github/
│   └── workflows/
│       └── build-and-test.yml  # CI/CD pipeline
├── .env.example              # Environment variable template
├── .env                       # Local development env
├── .env.production           # Production env (for CI/CD)
├── capacitor.config.json     # Mobile app config
├── firebase.json             # Firebase hosting config
├── firestore.rules           # Firestore security rules
├── vite.config.js            # Vite dev config
├── vite.config.prod.js       # Vite production config
├── vitest.config.js          # Test runner config
└── package.json              # Dependencies & scripts
```

---

## Technology Stack

### Frontend
- **React 19** — UI framework
- **Vite 8** — Build tool (hot module reload, code splitting)
- **Framer Motion 12** — Animations & transitions
- **TailwindCSS / CSS Modules** — Styling

### Mobile
- **Capacitor 8** — Native bridge (Android APK wrapper)
- **@capacitor-firebase/authentication** — Native Google/Phone auth
- **@capacitor/filesystem, @capacitor/share** — Native APIs

### Backend
- **Firebase** — Real-time database & auth
  - Firestore — NoSQL document store
  - Authentication — Google, Phone OTP, Demo
  - Hosting — Web deployment

### AI & Features
- **Google Gemini 1.5 Flash** — AI chat & job parsing
- **Three.js + OGL** — 3D background effects
- **jsPDF** — PDF export for reports
- **react-speech-recognition** — Voice commands

### Testing & QA
- **Vitest** — Unit testing
- **@testing-library/react** — React component testing
- **Cypress** — E2E testing
- **ESLint** — Code quality

### DevOps
- **GitHub Actions** — CI/CD pipeline
- **Firebase Hosting** — Web deployment
- **Firebase Emulator** — Local development

---

## Development

### Running the App

**Development mode** (hot reload):
```bash
npm run dev
```

**Preview production build**:
```bash
npm run preview
```

**With Android emulator**:
```bash
npx cap sync android
npx cap open android
# Build & run from Android Studio
```

### Code Quality

**Lint code**:
```bash
npm run lint
```

**Fix lint issues** (auto-format):
```bash
npm run lint -- --fix
```

### Environment Variables

Copy `.env.example` → `.env` and update with your values:

```dotenv
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id_here
VITE_FIREBASE_APP_ID=1:your_id:web:your_id_here
VITE_GOOGLE_WEB_CLIENT_ID=your_client_id_here

# AI & APIs
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_SENTRY_DSN=your_sentry_dsn_here

# Development
VITE_USE_MOCK=true              # true for mock data, false for real Firestore
VITE_E2E_MODE=true              # true for test mode with mock users
VITE_USE_FIREBASE_EMULATOR=false  # true to use local Firebase emulator
```

**For production** (`.env.production`):
```dotenv
VITE_USE_MOCK=false
VITE_E2E_MODE=false
# Other variables come from CI/CD secrets
```

---

## Testing

### Unit Tests

Run all tests once:
```bash
npm run test:run
```

Run tests in watch mode (development):
```bash
npm run test
```

View test dashboard:
```bash
npm run test:ui
```

Generate coverage report:
```bash
npm run test:coverage
```

### E2E Tests (Cypress)

**Install Cypress** (first time):
```bash
npm install --save-dev cypress
```

**Open Cypress UI** (interactive):
```bash
npm run e2e
```

**Run E2E tests headless** (CI/CD):
```bash
npm run e2e:run
```

### Test Coverage

Current coverage: **100% function coverage** for critical functions

| Function | Tests | Status |
|----------|-------|--------|
| `calculateLevel()` | 6 | ✅ |
| `getProgressToNextLevel()` | 5 | ✅ |
| `sanitizeText()` | 10 | ✅ |
| `rateLimiter.check()` | 4 | ✅ |
| `calcDistance()` | 7 | ✅ |
| Geofence validation | 5 | ✅ |

See [`src/tests/TESTING_GUIDE.md`](src/tests/TESTING_GUIDE.md) for detailed testing documentation.

---

## Deployment

### Firebase Hosting

**First-time setup**:
```bash
firebase login
firebase init hosting
```

**Deploy to production**:
```bash
npm run build:prod
firebase deploy --only hosting
```

**View deployed app**:
```bash
firebase open hosting:site
```

### GitHub Actions CI/CD

**Automatic pipeline** on every push to `main`:
1. ✅ Lint code
2. ✅ Run unit tests
3. ✅ Generate coverage report
4. ✅ Build production bundle
5. ✅ Security scan
6. ✅ E2E tests (optional)
7. ✅ Deploy to Firebase

**Environment variables in GitHub Secrets**:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_GEMINI_API_KEY
VITE_SENTRY_DSN
FIREBASE_SERVICE_ACCOUNT_JOB_GENIE (service account JSON)
FIREBASE_PROJECT_ID
```

**Pre-deployment checklist**:
- [ ] All tests pass: `npm run test:run`
- [ ] Code coverage adequate
- [ ] Build succeeds: `npm run build:prod`
- [ ] Environment variables set in GitHub Secrets
- [ ] Firestore security rules deployed
- [ ] Firebase service account added to GitHub

### Manual Deployment

```bash
# Build production
npm run build:prod

# Deploy to Firebase
firebase deploy

# Or deploy to other hosting (e.g., Vercel)
vercel deploy --prod
```

---

## Security

### Best Practices

1. **Never commit secrets**
   - Use `.env.example` for safe placeholders
   - `.env` and `.env.production` are in `.gitignore`
   - Secrets loaded from CI/CD environment variables

2. **Firestore Security Rules**
   - Workers cannot read other workers' data
   - Workers cannot self-promote to admin
   - Role stored only in Firestore (not localStorage)
   - Application status only changeable by admins
   - See [`firestore.rules`](firestore.rules) for full rules

3. **Input Sanitization**
   - All user input sanitized via `sanitizeText()`
   - Removes HTML tags, JavaScript execution patterns
   - Prevents XSS (Cross-Site Scripting) attacks
   - See [`src/services/securityService.js`](src/services/securityService.js)

4. **Rate Limiting**
   - Application submissions: 3 per 60 seconds
   - Review submissions: 3 per 60 seconds
   - Prevents spam and brute-force attacks

5. **Production Safety**
   - MockFirestore automatically disabled in production
   - Double-layer protection: environment variable + code check
   - Fatal error thrown if mock enabled in production

### Reporting Security Issues

**Do not open public issues for security vulnerabilities**

Email security concerns to: `security@jobgenie.com`

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

---

## Troubleshooting

### "npm is not recognized"
**Windows**: Add Node.js to PATH
1. Search "Environment Variables" in Windows
2. Click "Edit the system environment variables"
3. Click "Environment Variables..."
4. Add `C:\Program Files\nodejs` to PATH

### "Port 5173 already in use"
```bash
# Kill existing process
# On Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# On Mac/Linux
lsof -ti :5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### "Firebase authentication not working"
1. Check `.env` has correct Firebase credentials
2. Verify Firebase project exists: https://console.firebase.google.com
3. Check Google OAuth consent screen is configured
4. Try with mock mode: `VITE_USE_MOCK=true`

### "Tests failing locally but passing in CI"
1. Clear test cache: `npm run test -- --clearCache`
2. Run in isolation: `npm run test:run`
3. Check for timing issues: Use `vi.useFakeTimers()` in tests

### "Build fails with 'chunk exceeds size limit'"
1. Analyze bundle: `npm run build:prod 2>&1 | grep "is larger than"`
2. Check `vite.config.prod.js` for code splitting settings
3. Consider lazy-loading large components
4. Use compression: Enable gzip on server

### "App crashes on mobile device"
1. Check Android logcat for errors:
   ```bash
   adb logcat | grep Job-Genie
   ```
2. Verify Capacitor config: `capacitor.config.json`
3. Test with emulator first: `npx cap open android`
4. Check safe area handling for notches

---

## Performance

### Bundle Size
- **Target**: < 500KB gzip
- **Current**: ~350KB gzip (with code splitting)

### Optimization Tips
1. **Lazy load large dependencies**
   - 3D effects (Three.js, OGL) loaded on-demand
   - AI service initialized only when used

2. **Image optimization**
   - Convert to WebP + AVIF
   - Compress before adding to repo

3. **Monitor builds**
   ```bash
   npm run build:prod -- --outDir dist-analyze
   ```

---

## Contributing

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test**
   ```bash
   npm run lint      # Check code quality
   npm run test:run  # Run all tests
   npm run build:prod # Verify production build
   ```

3. **Commit with clear message**
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug"
   git commit -m "docs: update README"
   ```

4. **Push and create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style

- **No TypeScript yet**, but use JSDoc for function documentation
- **ESLint** enforces code style (run `npm run lint -- --fix`)
- **Functional components** with React hooks
- **Named exports** for services, constants
- **Descriptive variable names** (avoid abbreviations)

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat: add geofence validation for check-in

- Implement Haversine distance calculation
- Add 500m radius enforcement
- Add unit tests (100% coverage)

Fixes #123
```

---

## License

MIT License — See [`LICENSE`](LICENSE) for details

---

## Support

- **Documentation**: [Job Genie Docs](https://docs.jobgenie.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/job-genie/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/job-genie/discussions)
- **Email**: support@jobgenie.com

---

## Roadmap

- [ ] TypeScript migration (Q3 2024)
- [ ] Dark mode support (Q2 2024)
- [ ] Offline-first architecture (Q4 2024)
- [ ] Push notifications (Q2 2024)
- [ ] Real-time worker location tracking (Q3 2024)
- [ ] Advanced analytics dashboard (Q4 2024)

---

**Last Updated**: June 2024  
**Maintained by**: Job Genie Development Team
