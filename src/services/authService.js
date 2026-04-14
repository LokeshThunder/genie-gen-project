import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { auth } from './firebaseConfig';

export const AuthService = {
  // Google Sign In
  signInWithGoogle: async () => {
    try {
      const result = await FirebaseAuthentication.signInWithGoogle();
      if (!result || !result.user) throw new Error("Google Sign In returned no user data.");
      return result.user;
    } catch (error) {
      console.error("Google Sign In Error:", error);
      throw error;
    }
  },

  // Phone Auth (OTP)
  signInWithPhone: async (phoneNumber) => {
    try {
      console.log("Attempting native Phone Auth for:", phoneNumber);
      const result = await FirebaseAuthentication.signInWithPhoneNumber({
        phoneNumber,
      });

      if (!result) {
        throw new Error("Native Auth Plugin returned 'undefined'. Check if SHA-1 is added in Firebase Console and google-services.json is up to date.");
      }

      if (!result.verificationId) {
        throw new Error("Failed to get verificationId from plugin. Please check your Firebase project settings.");
      }

      return result.verificationId;
    } catch (error) {
      console.error("Phone Auth Error Details:", error);
      if (error.message.includes("app not authorized")) {
        throw new Error("Device not authorized. Please ensure SHA-1 fingerprint is added to Firebase Console and SafetyNet/Play Integrity is enabled.");
      }
      throw error;
    }
  },

  confirmVerificationCode: async (verificationId, verificationCode) => {
    try {
      const result = await FirebaseAuthentication.confirmVerificationCode({
        verificationId,
        verificationCode,
      });
      
      if (!result || !result.user) {
        throw new Error("Verification failed: Native plugin returned no user data.");
      }

      return result.user;
    } catch (error) {
      console.error("OTP Verification Error:", error);
      throw error;
    }
  },

  signOut: async () => {
    await FirebaseAuthentication.signOut();
  },

  getCurrentUser: async () => {
    try {
      const result = await FirebaseAuthentication.getCurrentUser();
      return result ? result.user : null;
    } catch (e) {
      return null;
    }
  }
};
