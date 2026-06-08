import { 
  GoogleAuthProvider, 
  signInWithCredential, 
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import { auth } from './firebaseConfig';

export const AuthService = {
  // Fresh v3 Google Sign In (Using Native Plugin for Android)
  signInWithGoogle: async () => {
    try {
      console.log("AuthService: Starting Google Sign-In sequence...");
      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
        console.log("AuthService: Native environment detected. Initializing Firebase Native Auth.");
        
        // Critical: Explicitly pass the webClientId to ensure Android/iOS handshake
        const webClientId = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID;
        
        try {
          const result = await FirebaseAuthentication.signInWithGoogle({
            clientId: webClientId
          });
          console.log("AuthService: Native Google result received", !!result);
          
          if (result && result.credential) {
            const { idToken } = result.credential;
            if (!idToken) {
              throw new Error("Google Sign-In failed: No ID Token received from provider.");
            }
            
            console.log("AuthService: Received ID Token, bridging to Firebase JS SDK...");
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);
            return userCredential.user;
          } else {
            throw new Error("Google Sign-In failed: No credential returned from native layer.");
          }
        } catch (nativeError) {
          console.warn("AuthService: Native Google Sign-In failed or timed out:", nativeError);
          throw nativeError;
        }
      }

      // Web Fallback (Standard Firebase Popup)
      console.log("AuthService: Web environment detected. Using Popup flow.");
      const { signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      
      try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
      } catch (popupError) {
        console.warn("AuthService: Web Google Sign-In popup failed or timed out:", popupError);
        throw popupError;
      }
    } catch (error) {
      console.error("AuthService: CRITICAL Google Sign-In Error:", error);
      // Provide more user-friendly error messages for common mobile auth issues
      if (error.message?.includes('12500') || error.message?.includes('10')) {
        throw new Error("Google Auth Error: This is likely a configuration mismatch (SHA-1 fingerprint). Please verify Firebase Console settings.");
      }
      throw error;
    }
  },

  signInWithPhone: async (phoneNumber) => {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      return confirmationResult.verificationId;
    } catch (error) {
      console.error("AuthService: Phone Sign-In Error:", error);
      throw error;
    }
  },

  verifyOTP: async (verificationId, code) => {
    try {
      if (!window.confirmationResult) {
        throw new Error("Verification session expired or invalid. Please request a new OTP.");
      }
      const result = await window.confirmationResult.confirm(code);
      return result.user;
    } catch (error) {
      console.error("AuthService: OTP Verification Error:", error);
      throw error;
    }
  },

  getCurrentUser: () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  },

  signInAsTestUser: async (role) => {
    console.log(`AuthService: Signing in as Test ${role}`);
    // Simulate a firebase user object
    const testUser = {
      uid: role === 'super_admin' ? 'test_super_admin_id' : (role === 'admin' ? 'test_admin_id' : 'test_worker_id'),
      displayName: role === 'super_admin' ? 'Super Admin' : (role === 'admin' ? 'Test Admin' : 'Test Worker'),
      email: `${role}@test.com`,
      photoURL: '👤'
    };
    // We can't easily inject into onAuthStateChanged without real firebase auth,
    // so we'll rely on the App.jsx handleLogin to set this user state.
    return testUser;
  }
};
