# Project Structure

## Top-Level Layout

```
/
├── src/                  # All application source code
├── android/              # Capacitor Android project (generated, don't edit manually)
├── dist/                 # Vite build output — synced to Android via `cap sync`
├── public/               # Static assets served as-is
├── .kiro/                # Kiro steering and settings
├── .env                  # Firebase + Gemini API keys (never commit)
├── capacitor.config.json # Capacitor app config (appId, webDir, plugins)
├── vite.config.js        # Vite build config
├── firebase.json         # Firebase emulator config
├── firestore.rules       # Firestore security rules
└── index.html            # App entry point
```

## Source Directory (`src/`)

```
src/
├── App.jsx               # Root component — auth state, role routing, screen switching
├── main.jsx              # React entry point — mounts App inside BrowserRouter + ErrorBoundary
├── index.css             # Global styles, CSS variables, theme tokens
├── App.css               # App-level styles
│
├── screens/              # Full-page screen components (one per route/tab)
├── components/           # Reusable UI components
├── services/             # All backend/API logic
├── constants/            # Static data: translations, gamification, job types
└── utils/                # Pure utility functions
```

## Screens (`src/screens/`)

Each file is a self-contained screen component. Navigation is handled by `setActive(screenName, params)` passed as a prop — there are no React Router `<Route>` declarations.

| Screen | Role | Purpose |
|---|---|---|
| `LoginScreen` | All | Auth (Google, Phone OTP, Demo) |
| `OnboardingScreen` | All | First-time profile setup |
| `HomeScreen` | Worker | Dashboard, active shift, XP card |
| `FindGigScreen` | Worker | Job search and browse |
| `JobDetailsScreen` | Worker | Job detail + apply |
| `MyJobsScreen` | Worker | Applied/active/completed jobs |
| `AttendanceScreen` | Worker | Check-in/check-out with geofence |
| `TasksScreen` | Worker | Per-job task checklist |
| `EarningsScreen` | Worker | Earnings history and withdrawal |
| `EarningsPlannerScreen` | Worker | AI-powered earnings goal planner |
| `ProfileScreen` | All | Profile view/edit, settings, language |
| `WorkerAIScreen` | Worker | Genie AI chatbot |
| `ChatScreen` | Admin | Genie Ops chatbot |
| `AdminDashboard` | Admin | Job/application/attendance overview |
| `AdminJobsScreen` | Admin | Job listing management |
| `CreateJobScreen` | Admin | Post/edit a job (manual or AI voice) |
| `WorkerApplicationsScreen` | Admin | Review and approve applicants |
| `ReportsScreen` | Admin | Analytics and CSV/PDF export |
| `TrackingScreen` | Admin | Live worker location radar |
| `SuperAdminDashboard` | Super Admin | Platform-wide stats, fraud, AI config |
| `BenefitsScreen` | Worker | Insurance and healthcare info |
| `LoansScreen` | Worker | Genie Credit Line / micro-loan flow |
| `SafetyScreen` | Worker | Safety shield, SOS, trusted contacts |
| `SkillTreeScreen` | Worker | Career progression paths |
| `LeaderboardScreen` | Worker | Hub ranking by trust score |

## Components (`src/components/`)

- `NavBar.jsx` — bottom tab bar, role-aware (worker vs admin tabs), center AI/Create button
- `LoadingScreen.jsx` — splash/loading state
- `ErrorBoundary.jsx` — top-level React error boundary
- `AdBanner.jsx` — rotating promotional banners (loans, referral, insurance)
- `AIChatbot.jsx` — shared chat UI component
- `GenieActionBar.jsx` — floating action bar
- `GenieVoiceAssistant.jsx` — voice command overlay
- `TutorialModal.jsx` — onboarding tips + `NotificationBanner`
- `RatingModal.jsx` — post-job employer rating
- `Galaxy.jsx`, `LiquidEther/`, `Hyperspeed.jsx`, `GridDistortion.jsx` — animated 3D background effects (Three.js / OGL)
- `HolographicPass/` — post-processing shader effect

## Services (`src/services/`)

| File | Purpose |
|---|---|
| `firebaseConfig.js` | Firebase app init, auth, Firestore, emulator wiring |
| `firestoreService.js` | All Firestore CRUD + real-time streams. **Currently routes to MockFirestore** |
| `mockFirestore.js` | In-memory mock data store used during development/testing |
| `authService.js` | Auth helpers (login, logout, role detection) |
| `aiService.js` | Gemini AI integration — chat, job parsing, bio/vision generation, voice |
| `jobService.js` | Job-specific business logic |
| `notificationService.js` | Push notification helpers |
| `hapticService.js` | Capacitor haptic feedback |
| `heartbeatService.js` | Worker location heartbeat for geofencing |
| `exportService.js` | PDF/CSV report generation |
| `operationalService.js` | Operational log data |
| `knowledgeService.js` | Static knowledge base for AI context |

## Constants (`src/constants/`)

- `translations.js` — `TRANSLATIONS` object keyed by language name; `LANGUAGES` array with label/flag/code. All UI strings go through `t = TRANSLATIONS[currentLang]`.
- `gamification.js` — `XP_LEVELS`, `SKILL_PATHS`, `BADGES`, `calculateLevel()`, `getProgressToNextLevel()`
- `jobConstants.js` — job categories, status values, skill tags

## Key Architectural Patterns

**Navigation:** `App.jsx` owns `activeTab` state. Screens receive `setActive(tabName, params)` and `screenParams` as props. No React Router `useNavigate`.

**Translations:** Every screen receives `t` prop (`TRANSLATIONS[currentLang]`). Always use `t.key || 'Fallback'` — never hardcode user-facing strings.

**Role-based rendering:** `App.jsx` switches on `userRole` (`worker` | `admin` | `super_admin`) before rendering screens. Role comes from Firestore profile, never from localStorage alone.

**Data flow:** Firestore streams (`onSnapshot`) are set up in `App.jsx` and passed down as props (`adminJobs`, `applications`, `attendance`). Screens do not set up their own top-level listeners.

**Lazy loading:** All screens are `React.lazy()` imported and wrapped in `<Suspense fallback={<LoadingScreen />}>`.

**Design system:** See `DESIGN.md` — "Midnight Gold" dark theme. Primary fonts: Sora (headings) and Inter (body). CSS variables for spacing/colors in `index.css`. Theme stored in `localStorage` as `GENIE_THEME`.
