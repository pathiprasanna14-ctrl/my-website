import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  deleteUser,
  signOut,
  getFriendlyErrorMessage,
  type User
} from '../firebase';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  emailVerified: boolean;
  resendCooldown: number;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<User>;
  loginWithGoogle: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  updateAvatar: (photoURL: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Firebase auth state observer
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setEmailVerified(currentUser ? currentUser.emailVerified : false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Refresh user state manually (useful after verifying email)
  const refreshUser = useCallback(async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    try {
      await auth.currentUser.reload();
      const updatedUser = auth.currentUser;
      setUser(updatedUser);
      setEmailVerified(updatedUser.emailVerified);
      if (updatedUser.emailVerified) {
        addToast({
          type: 'success',
          title: 'Email Verified!',
          message: 'Your email address is now verified and active.'
        });
      }
      return updatedUser.emailVerified;
    } catch (err) {
      console.error('Failed to reload user:', err);
      return false;
    }
  }, [addToast]);

  // Periodic polling if logged in and unverified to detect verification
  useEffect(() => {
    if (!user || user.emailVerified) return;

    const interval = setInterval(async () => {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        try {
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified) {
            setUser(auth.currentUser);
            setEmailVerified(true);
            addToast({
              type: 'success',
              title: 'Email Verified!',
              message: 'Great news! Your email address has been successfully verified.'
            });
            clearInterval(interval);
          }
        } catch {
          // ignore silent reload errors
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, addToast]);

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      setUser(credential.user);
      setEmailVerified(credential.user.emailVerified);
      addToast({
        type: 'success',
        title: 'Welcome Back',
        message: `Signed in as ${credential.user.displayName || credential.user.email}`
      });
    } catch (error) {
      const msg = getFriendlyErrorMessage(error);
      addToast({
        type: 'error',
        title: 'Sign In Failed',
        message: msg
      });
      throw error;
    }
  };

  // Register with email, password, and displayName
  const register = async (email: string, password: string, displayName: string): Promise<User> => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      // Update display name
      if (displayName.trim()) {
        await updateProfile(credential.user, {
          displayName: displayName.trim(),
          photoURL: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(credential.user.uid)}`
        });
      }

      // Automatically send verification email
      try {
        await sendEmailVerification(credential.user);
        setResendCooldown(60);
        addToast({
          type: 'info',
          title: 'Verification Email Sent',
          message: `A verification link has been sent to ${email.trim()}. Please check your inbox and spam folder.`
        });
      } catch (verifyErr) {
        console.warn('Failed to send verification email automatically:', verifyErr);
      }

      // Reload user
      await credential.user.reload();
      setUser(auth.currentUser);
      setEmailVerified(auth.currentUser?.emailVerified || false);

      addToast({
        type: 'success',
        title: 'Account Created',
        message: 'Your account has been registered successfully.'
      });

      return credential.user;
    } catch (error) {
      const msg = getFriendlyErrorMessage(error);
      addToast({
        type: 'error',
        title: 'Registration Failed',
        message: msg
      });
      throw error;
    }
  };

  // Google sign in with popup
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setEmailVerified(result.user.emailVerified);
      addToast({
        type: 'success',
        title: 'Google Sign In Successful',
        message: `Welcome, ${result.user.displayName || result.user.email}!`
      });
    } catch (error) {
      const msg = getFriendlyErrorMessage(error);
      addToast({
        type: 'error',
        title: 'Google Sign In Failed',
        message: msg
      });
      throw error;
    }
  };

  // Send or resend verification email
  const sendVerificationEmailAction = async () => {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in.');
    }
    if (resendCooldown > 0) {
      addToast({
        type: 'warning',
        title: 'Please Wait',
        message: `You can request another verification email in ${resendCooldown}s.`
      });
      return;
    }

    try {
      await sendEmailVerification(auth.currentUser);
      setResendCooldown(60);
      addToast({
        type: 'success',
        title: 'Verification Email Dispatched',
        message: `A fresh verification link was sent to ${auth.currentUser.email}. Check your spam or promotions folder.`
      });
    } catch (error) {
      const msg = getFriendlyErrorMessage(error);
      addToast({
        type: 'error',
        title: 'Verification Email Failed',
        message: msg
      });
      throw error;
    }
  };

  // Send password reset email
  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      addToast({
        type: 'success',
        title: 'Password Reset Email Sent',
        message: `If an account exists for ${email.trim()}, instructions to reset your password have been sent.`
      });
    } catch (error) {
      const msg = getFriendlyErrorMessage(error);
      addToast({
        type: 'error',
        title: 'Password Reset Request Failed',
        message: msg
      });
      throw error;
    }
  };

  // Update display name
  const updateDisplayName = async (newDisplayName: string) => {
    if (!auth.currentUser) throw new Error('No user logged in.');
    try {
      await updateProfile(auth.currentUser, { displayName: newDisplayName.trim() });
      await auth.currentUser.reload();
      setUser(auth.currentUser);
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your display name has been updated successfully.'
      });
    } catch (error) {
      const msg = getFriendlyErrorMessage(error);
      addToast({
        type: 'error',
        title: 'Profile Update Failed',
        message: msg
      });
      throw error;
    }
  };

  // Update avatar URL
  const updateAvatar = async (photoURL: string) => {
    if (!auth.currentUser) throw new Error('No user logged in.');
    try {
      await updateProfile(auth.currentUser, { photoURL });
      await auth.currentUser.reload();
      setUser(auth.currentUser);
      addToast({
        type: 'success',
        title: 'Avatar Updated',
        message: 'Your profile picture has been updated.'
      });
    } catch (error) {
      const msg = getFriendlyErrorMessage(error);
      addToast({
        type: 'error',
        title: 'Avatar Update Failed',
        message: msg
      });
      throw error;
    }
  };

  // Change password
  const changePassword = async (newPassword: string) => {
    if (!auth.currentUser) throw new Error('No user logged in.');
    try {
      await updatePassword(auth.currentUser, newPassword);
      addToast({
        type: 'success',
        title: 'Password Changed',
        message: 'Your password has been changed securely.'
      });
    } catch (error) {
      const msg = getFriendlyErrorMessage(error);
      addToast({
        type: 'error',
        title: 'Password Change Failed',
        message: msg
      });
      throw error;
    }
  };

  // Delete account
  const deleteAccount = async () => {
    if (!auth.currentUser) throw new Error('No user logged in.');
    try {
      await deleteUser(auth.currentUser);
      setUser(null);
      setEmailVerified(false);
      addToast({
        type: 'info',
        title: 'Account Deleted',
        message: 'Your account has been deleted.'
      });
    } catch (error) {
      const msg = getFriendlyErrorMessage(error);
      addToast({
        type: 'error',
        title: 'Account Deletion Failed',
        message: msg
      });
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setEmailVerified(false);
      addToast({
        type: 'info',
        title: 'Signed Out',
        message: 'You have been signed out successfully.'
      });
    } catch (error) {
      const msg = getFriendlyErrorMessage(error);
      addToast({
        type: 'error',
        title: 'Sign Out Error',
        message: msg
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        emailVerified,
        resendCooldown,
        toasts,
        addToast,
        removeToast,
        login,
        register,
        loginWithGoogle,
        sendVerificationEmail: sendVerificationEmailAction,
        sendPasswordReset,
        updateDisplayName,
        updateAvatar,
        changePassword,
        deleteAccount,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
