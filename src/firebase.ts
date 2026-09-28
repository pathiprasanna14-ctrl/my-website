import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  updateProfile, 
  updatePassword,
  deleteUser,
  signOut,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
  type User,
  type AuthError
} from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Web app's Firebase configuration provided by the user
export const firebaseConfig = {
  apiKey: "AIzaSyADD_RNhNqfS5KdCzLJpR74h6EPyi5F9nw",
  authDomain: "ecosort-smart-waste-classifeir.firebaseapp.com",
  projectId: "ecosort-smart-waste-classifeir",
  storageBucket: "ecosort-smart-waste-classifeir.firebasestorage.app",
  messagingSenderId: "738315741164",
  appId: "1:738315741164:web:3e56d24764a5e07dc682c9",
  measurementId: "G-RN90DLE5G8"
};

// Initialize Firebase safely
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Analytics conditionally
export const initAnalytics = async () => {
  if (typeof window !== 'undefined' && await isSupported()) {
    try {
      return getAnalytics(app);
    } catch {
      return null;
    }
  }
  return null;
};

// Friendly Firebase error message translator
export function getFriendlyErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred.';
  
  const authError = error as AuthError;
  const code = authError.code || '';
  const message = authError.message || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Try logging in instead.';
    case 'auth/invalid-email':
      return 'The email address format is invalid. Please check for typos.';
    case 'auth/user-not-found':
      return 'No user found with this email. Please check your email or register a new account.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please verify and try again, or use "Forgot Password".';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials and try again.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters with a mix of letters, numbers, and symbols.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily restricted due to many failed attempts. Please try again in a few minutes or reset your password.';
    case 'auth/operation-not-allowed':
      return 'Email/Password or Provider sign-in is not enabled in the Firebase Console. Please enable it under Firebase Console > Authentication > Sign-in method.';
    case 'auth/unauthorized-domain':
      return `This domain (${typeof window !== 'undefined' ? window.location.hostname : 'current domain'}) is not authorized in Firebase Auth. Add it in Firebase Console > Authentication > Settings > Authorized domains.`;
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing authentication. Please try again.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/requires-recent-login':
      return 'This sensitive operation requires recent authentication. Please sign out and sign back in to continue.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/expired-action-code':
      return 'This verification or password reset link has expired. Please request a new link.';
    case 'auth/invalid-action-code':
      return 'This verification link is invalid or has already been used.';
    default:
      if (message.includes('auth/')) {
        return message.replace('Firebase: ', '');
      }
      return message || 'An error occurred during authentication. Please try again.';
  }
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  deleteUser,
  signOut,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
  type User
};
