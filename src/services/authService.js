import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

export const AuthService = {
  // Google Sign In
  signInWithGoogle: async () => {
    try {
      if (typeof FirebaseAuthentication === 'undefined' || !FirebaseAuthentication.signInWithGoogle) {
        console.warn("FirebaseAuthentication plugin not found. Falling back to mock login for web.");
        return { uid: 'mock_admin_123', email: 'admin@jobgenie.com', displayName: 'Admin Genie' };
      }
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
      if (typeof FirebaseAuthentication === 'undefined' || !FirebaseAuthentication.signInWithPhoneNumber) {
        console.warn("Phone Auth plugin not available. Auto-generating mock verification ID.");
        return 'mock_verification_id_123';
      }
      console.log("Attempting native Phone Auth for:", phoneNumber);
      const result = await FirebaseAuthentication.signInWithPhoneNumber({
        phoneNumber,
      });

      if (!result) {
        throw new Error("Native Auth Plugin returned 'undefined'. Check setup.");
      }

      return result.verificationId;
    } catch (error) {
      console.error("Phone Auth Error Details:", error);
      throw error;
    }
  },

  confirmVerificationCode: async (verificationId, verificationCode) => {
    try {
      if (typeof FirebaseAuthentication === 'undefined' || !FirebaseAuthentication.confirmVerificationCode) {
        console.warn("Native OTP verify not available. Mocking success for verification code.");
        return { uid: 'mock_user_123', phoneNumber: '1111111111', displayName: 'Test Worker' };
      }
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
    try {
      if (typeof FirebaseAuthentication !== 'undefined' && FirebaseAuthentication.signOut) {
        await FirebaseAuthentication.signOut();
      }
    } catch (e) {
      console.warn("Native SignOut failed, ignoring for web.");
    }
  },

  getCurrentUser: async () => {
    try {
      if (typeof FirebaseAuthentication === 'undefined' || !FirebaseAuthentication.getCurrentUser) {
        return null;
      }
      const result = await FirebaseAuthentication.getCurrentUser();
      return result ? result.user : null;
    } catch (_e) {
      return null;
    }
  }
};
