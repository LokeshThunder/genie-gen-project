import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  connectAuthEmulator, 
  browserLocalPersistence,
  setPersistence 
} from "firebase/auth";
import { 
  initializeFirestore,
  connectFirestoreEmulator,
  memoryLocalCache,
  getFirestore
} from "firebase/firestore";

// Shielded Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Defensive Initialization
let app;
if (!getApps().length) {
  console.log("[Firebase] Initializing NEW core service...");
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);

// Modern Firestore initialization.
// PERF FIX: Using memoryLocalCache instead of persistentMultipleTabManager.
// The multi-tab manager does an expensive IndexedDB lock negotiation on every
// cold start which blocks the Firestore SDK for 2–5 seconds before any reads
// can begin. memoryLocalCache starts instantly (no lock needed) while still
// keeping data in memory for the session.
let db;
try {
  db = initializeFirestore(app, {
    localCache: memoryLocalCache()
  });
} catch (e) {
  // Already initialized (e.g. hot reload) — fall back to getFirestore
  console.warn("[Firebase] initializeFirestore already called, using getFirestore.", e.message);
  db = getFirestore(app);
}

// Use LOCAL persistence so Firebase restores sessions across cold app launches.
// This means users stay logged in until they explicitly hit "Log Out".
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .then(() => console.log("[Firebase] Auth persistence set to LOCAL (stays logged in)"))
    .catch((err) => console.warn("[Firebase] Auth persistence failed:", err));
}

// Hardened Emulator Support
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

if (useEmulator) {
  // CRITICAL PRODUCTION GUARD: Prevent emulator from running in production
  if (import.meta.env.MODE === 'production') {
    throw new Error(
      '[FATAL] Firebase Emulator is enabled in production mode! ' +
      'This is a critical misconfiguration. Remove VITE_USE_FIREBASE_EMULATOR=true ' +
      'from .env.production and redeploy immediately. All production data would be ' +
      'redirected to a local emulator, causing data loss and security breaches.'
    );
  }

  const emulatorHost = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || 'localhost';
  const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform();
  
  // Critical for Android Emulator to see host machine
  const host = (emulatorHost === 'localhost' && isNative) ? '10.0.2.2' : emulatorHost;
  
  console.warn(`[Firebase] ATTACHING TO EMULATORS AT ${host}...`);
  
  try {
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, host, 8080);
    console.log("[Firebase] Emulator handshakes SUCCESSFUL");
  } catch (e) {
    console.error("[Firebase] Emulator connection FAILED:", e);
  }
}

export { auth, db };
export default app;
