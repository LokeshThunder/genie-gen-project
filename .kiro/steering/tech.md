# Tech Stack & Build System

## Core Stack

- **Framework:** React 19 (JSX, no TypeScript)
- **Build Tool:** Vite 8 with `@vitejs/plugin-react`
- **Mobile:** Capacitor 8 — wraps the web app as an Android APK (`appId: com.jobgenie.job_genie`)
- **Routing:** React Router DOM v7, but navigation is **tab-based state** (`activeTab` in `App.jsx`), not URL-based routes
- **Animation:** Framer Motion 12
- **Backend:** Firebase (Firestore + Auth)
- **AI:** Google Gemini via `@google/generative-ai` (models: `gemini-1.5-flash`, fallback chain)

## Firebase

- Auth: Google Sign-In and Phone/OTP via `@capacitor-firebase/authentication`
- Firestore: real-time listeners (`onSnapshot`) for jobs, applications, attendance
- **MockFirestore is currently force-enabled** — `isMockEnabled()` in `firestoreService.js` always returns `true`. All reads/writes go to `mockFirestore.js`, not real Firestore.
- Emulator support: set `VITE_USE_FIREBASE_EMULATOR=true` in `.env`; Android emulator uses `10.0.2.2` as host

## Environment Variables (`.env`)

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_GEMINI_API_KEY
VITE_USE_FIREBASE_EMULATOR   # "true" to use local emulators
VITE_FIREBASE_EMULATOR_HOST  # defaults to "localhost"
```

## Key Libraries

| Library | Purpose |
|---|---|
| `firebase` v12 | Firestore, Auth |
| `@capacitor-firebase/authentication` | Native Google/Phone auth |
| `@capacitor/filesystem`, `@capacitor/share` | Native file/share APIs |
| `framer-motion` | Page transitions, animations |
| `react-speech-recognition` | Voice assistant |
| `@google/generative-ai` | Gemini AI chat/parsing |
| `three`, `ogl`, `postprocessing` | 3D background effects (Galaxy, LiquidEther, Hyperspeed) |
| `jspdf`, `jspdf-autotable` | PDF export for reports |
| `html-to-image` | Screenshot/share card generation |

## Common Commands

```bash
# Development server (web)
npm run dev

# Production build (outputs to /dist)
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# Sync web build to Android
npx cap sync android

# Open Android Studio
npx cap open android

# Run Firebase emulators
firebase emulators:start
```

## Vite Config Notes

- `base: './'` — required for Capacitor (relative asset paths)
- `process.env` is shimmed to `{}` and `global` to `globalThis` for Firebase SDK compatibility
