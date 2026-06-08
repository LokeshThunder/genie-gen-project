import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { FirestoreService } from '../services/firestoreService';

// Pre-import Capacitor Preferences once at module load (avoids dynamic import in hot auth path)
let _Preferences = null;
(async () => {
  try {
    const mod = await import('@capacitor/preferences');
    _Preferences = mod.Preferences;
  } catch (e) { /* Not available in web builds */ }
})();

/**
 * Handles all Firebase auth state, user profile loading, login and logout.
 * Extracted from App.jsx to keep it focused on rendering.
 */
export function useAuth() {
  const [isLoggedIn, setIsLoggedIn]     = useState(false);
  const [user, setUser]                 = useState(null);
  const [userProfile, setUserProfile]   = useState(null);
  const [userRole, setUserRole]         = useState('worker');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // ── E2E Test Bypass ────────────────────────────────────────────────────
    if (import.meta.env.VITE_E2E_MODE === 'true') {
      const savedRole = localStorage.getItem('GENIE_ROLE') || 'worker';
      const mockProfiles = {
        super_admin: { name: 'Super Admin Command', role: 'super_admin', onboardingCompleted: true, xp: 5000 },
        admin:       { name: 'Genie Partner',       role: 'admin',       onboardingCompleted: true, xp: 1000 },
        worker:      { name: 'Genie Partner',       role: 'worker',      dob: '1995-08-15', gender: 'Male', experience: '3 Years', preferredAreas: 'Chennai, Bangalore', skills: ['DELIVERY', 'LOGISTICS', 'SUPPORT'], onboardingCompleted: true, xp: 1000 },
      };
      setUser({ uid: `test-${savedRole}-uid`, email: `${savedRole}@genie.com` });
      setUserRole(savedRole);
      setUserProfile(mockProfiles[savedRole] || mockProfiles.worker);
      setIsLoggedIn(true);
      setInitializing(false);
      return;
    }

    // ── PERF FIX: Hard timeout on initializing ─────────────────────────────
    // If Firebase Auth takes >4 seconds (offline / slow network / cold start),
    // we force-clear the splash screen so the user sees the login UI instead
    // of being stuck on an infinite loading spinner.
    const initTimeout = setTimeout(() => {
      console.warn('[useAuth] Auth init timed out after 4s — forcing initializing=false');
      setInitializing(false);
    }, 4000);

    // ── Helper: getDoc with timeout ────────────────────────────────────────
    // Prevents a slow Firestore response from blocking auth resolution.
    const getUserProfileWithTimeout = (uid, ms = 2500) => {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('getUserProfile timed out')), ms)
      );
      return Promise.race([FirestoreService.getUserProfile(uid), timeout]);
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(initTimeout); // Auth responded — cancel the hard timeout
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          // Read intended role from all sources in parallel (no sequential awaits)
          const [profile, prefRole] = await Promise.all([
            getUserProfileWithTimeout(firebaseUser.uid),
            _Preferences
              ? _Preferences.get({ key: 'INTENDED_LOGIN_ROLE' }).then(r => r.value).catch(() => null)
              : Promise.resolve(null),
          ]);

          let intendedRole = window.INTENDED_LOGIN_ROLE
            || localStorage.getItem('INTENDED_LOGIN_ROLE')
            || prefRole
            || null;

          // Apply intended role switch if needed
          let finalProfile = profile;
          if (intendedRole === 'admin' || intendedRole === 'worker') {
            if (finalProfile && finalProfile.role !== intendedRole) {
              console.log(`[useAuth] onAuthStateChanged: Applying intended role switch: ${finalProfile.role} -> ${intendedRole}`);
              finalProfile = { ...finalProfile, role: intendedRole, onboardingCompleted: false };
              await FirestoreService.saveUserProfile(firebaseUser.uid, finalProfile);
            } else if (!finalProfile) {
              finalProfile = {
                role: intendedRole,
                name: firebaseUser.displayName || '',
                email: firebaseUser.email || '',
                photoURL: firebaseUser.photoURL || '',
                onboardingCompleted: false
              };
              await FirestoreService.saveUserProfile(firebaseUser.uid, finalProfile);
            }
            // Clear intent flags
            try {
              localStorage.removeItem('INTENDED_LOGIN_ROLE');
              window.INTENDED_LOGIN_ROLE = null;
              if (_Preferences) await _Preferences.remove({ key: 'INTENDED_LOGIN_ROLE' });
            } catch (e) {}
          }

          if (finalProfile) {
            setUserProfile(finalProfile);
            setUserRole(intendedRole || finalProfile.role || 'worker');
          } else {
            setUserRole(intendedRole || 'worker');
            setUserProfile({ role: intendedRole || 'worker', onboardingCompleted: false });
          }
        } catch (err) {
          console.warn('[useAuth] Profile load slow/failed, using default profile:', err.message);
          setUserRole('worker');
          setUserProfile({ role: 'worker', onboardingCompleted: false });
        }
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setUserProfile(null);
        setUserRole('worker');
      }
      setInitializing(false);
    });

    return () => {
      clearTimeout(initTimeout);
      unsubscribe();
    };
  }, []);


  const handleLogin = async (role, firebaseUser) => {
    console.log(`[useAuth] handleLogin called with role=${role}, uid=${firebaseUser?.uid}`);
    setUser(firebaseUser);
    // Removed setIsLoggedIn(true) here to keep LoginScreen active until profile loads
    
    // SECURITY: Do NOT persist role to localStorage — role is authoritative from
    // Firestore only. Storing it in localStorage allows any user to open DevTools
    // and set localStorage['GENIE_ROLE'] = 'admin' to elevate their privileges.
    // HOWEVER, we use it as a FALLBACK during the initial login flow only
    
    // If role is not provided (can happen on mobile during race conditions),
    // check the temporary login intent flags
    let resolvedRole = role || 'worker';
    if (!resolvedRole || resolvedRole === 'worker') {
      const intentedRole = window.INTENDED_LOGIN_ROLE || localStorage.getItem('INTENDED_LOGIN_ROLE');
      console.log(`[useAuth] role parameter was empty/worker, checking intent flags: ${intentedRole}`);
      if (intentedRole === 'admin' || intentedRole === 'super_admin') {
        resolvedRole = intentedRole;
        console.log(`[useAuth] Restored role from intent flags: ${resolvedRole}`);
      }
    }

    let profile = null;
    if (firebaseUser?.uid) {
      profile = await FirestoreService.getUserProfile(firebaseUser.uid);
      console.log(`[useAuth] Profile loaded from Firestore: ${profile?.role || 'null'}`);
      
      if (!profile || !profile.role) {
        const isWorker = !resolvedRole || resolvedRole === 'worker';
        console.log(`[useAuth] Creating new profile for first-time login: role=${resolvedRole}`);
        
        if (isWorker) {
          profile = {
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            role: 'worker',
            onboardingCompleted: false,
          };
        } else {
          const defaults = {
            super_admin: { name: 'Super Admin Command', role: 'super_admin', onboardingCompleted: false, xp: 5000 },
            admin:       { name: 'Genie Partner',       role: 'admin',       onboardingCompleted: false, xp: 1000 },
          };
          profile = {
            ...defaults[resolvedRole],
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || ''
          };
        }
        await FirestoreService.saveUserProfile(firebaseUser.uid, profile);
      } else if (profile.role !== resolvedRole) {
        // For testing/development: allow role switching if they select a different role on the login screen
        console.log(`[useAuth] Role switching: ${profile.role} → ${resolvedRole}`);
        profile.role = resolvedRole;
        profile.onboardingCompleted = false; // Reset onboarding so they fill out role-specific details
        await FirestoreService.saveUserProfile(firebaseUser.uid, profile);
      }
    }

    const finalRole = profile?.role || resolvedRole || 'worker';
    console.log(`[useAuth] Final role set to: ${finalRole}`);
    setUserRole(finalRole);
    setUserProfile(profile || { role: finalRole, onboardingCompleted: false });
    setIsLoggedIn(true);
    
    // Clear temporary login intent flags after successful login
    window.INTENDED_LOGIN_ROLE = null;
    localStorage.removeItem('INTENDED_LOGIN_ROLE');
    if (_Preferences) {
      try { await _Preferences.remove({ key: 'INTENDED_LOGIN_ROLE' }); } catch (e) {}
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsLoggedIn(false);
    setUser(null);
    setUserProfile(null);
    setUserRole('worker');
  };

  // Force-clears the splash screen — called by the LoadingScreen escape hatch
  const forceReady = () => setInitializing(false);

  const handleOnboardingComplete = async (data, uid) => {
    const updatedProfile = { ...data, onboardingCompleted: true };
    if (data?.role) setUserRole(data.role);
    setUserProfile(updatedProfile);
    if (uid) {
      await FirestoreService.saveUserProfile(uid, updatedProfile);
    }
  };

  const updateProfile = async (newData, uid) => {
    const updated = { ...userProfile, ...newData };
    setUserProfile(updated);
    if (uid) {
      await FirestoreService.saveUserProfile(uid, updated);
    }
  };

  return {
    isLoggedIn, user, userProfile, userRole, initializing,
    handleLogin, handleLogout, handleOnboardingComplete, updateProfile, forceReady,
  };
}
