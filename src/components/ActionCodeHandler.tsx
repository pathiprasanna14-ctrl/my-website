import React, { useEffect, useState } from 'react';
import { 
  applyActionCode, 
  verifyPasswordResetCode, 
  confirmPasswordReset, 
  auth, 
  getFriendlyErrorMessage 
} from '../firebase';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertTriangle, KeyRound, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export const ActionCodeHandler: React.FC = () => {
  const { refreshUser, addToast } = useAuth();
  const [mode, setMode] = useState<string | null>(null);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [resetEmail, setResetEmail] = useState<string>('');
  
  // Reset password form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    const codeParam = params.get('oobCode');

    if (modeParam && codeParam) {
      setMode(modeParam);
      setOobCode(codeParam);

      if (modeParam === 'verifyEmail') {
        handleEmailVerification(codeParam);
      } else if (modeParam === 'resetPassword') {
        handleCheckPasswordResetCode(codeParam);
      }
    }
  }, []);

  const handleEmailVerification = async (code: string) => {
    setStatus('processing');
    setMessage('Verifying your email address with Firebase Auth...');

    try {
      await applyActionCode(auth, code);
      setStatus('success');
      setMessage('Your email address has been successfully verified! You now have full access.');
      await refreshUser();
      addToast({
        type: 'success',
        title: 'Email Verified!',
        message: 'Your email address is now verified.'
      });

      // Clear query params from URL without reload
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      setStatus('error');
      setMessage(getFriendlyErrorMessage(err));
      addToast({
        type: 'error',
        title: 'Verification Failed',
        message: getFriendlyErrorMessage(err)
      });
    }
  };

  const handleCheckPasswordResetCode = async (code: string) => {
    setStatus('processing');
    try {
      const email = await verifyPasswordResetCode(auth, code);
      setResetEmail(email);
      setStatus('idle'); // ready for form submission
    } catch (err) {
      setStatus('error');
      setMessage(getFriendlyErrorMessage(err));
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;

    if (newPassword.length < 6) {
      addToast({
        type: 'error',
        title: 'Weak Password',
        message: 'Password must be at least 6 characters long.'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast({
        type: 'error',
        title: 'Passwords Mismatch',
        message: 'Passwords do not match.'
      });
      return;
    }

    setIsResetting(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus('success');
      setMessage('Your password has been changed successfully. You can now sign in with your new password.');
      addToast({
        type: 'success',
        title: 'Password Updated',
        message: 'You can now sign in with your new password.'
      });
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      setStatus('error');
      setMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsResetting(false);
    }
  };

  const handleDismiss = () => {
    setMode(null);
    setOobCode(null);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  if (!mode || !oobCode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-center">
        {mode === 'verifyEmail' && (
          <div>
            {status === 'processing' && (
              <div className="py-6">
                <Loader2 className="w-12 h-12 text-sky-400 animate-spin mx-auto mb-4" />
                <h3 className="text-base font-semibold text-white">Verifying Email...</h3>
                <p className="text-xs text-slate-400 mt-1">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="py-4">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Verification Confirmed!</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{message}</p>
                <button
                  onClick={handleDismiss}
                  className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
                >
                  Continue to App
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="py-4">
                <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Verification Failed</h3>
                <p className="text-xs text-rose-300 mt-2 leading-relaxed">{message}</p>
                <button
                  onClick={handleDismiss}
                  className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}

        {mode === 'resetPassword' && (
          <div>
            {status === 'processing' && (
              <div className="py-6">
                <Loader2 className="w-12 h-12 text-sky-400 animate-spin mx-auto mb-4" />
                <h3 className="text-base font-semibold text-white">Validating Password Reset Link...</h3>
              </div>
            )}

            {status === 'idle' && (
              <div className="text-left">
                <div className="flex items-center gap-2 mb-4 justify-center">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Reset Password</h3>
                    <p className="text-xs text-slate-400">For {resetEmail}</p>
                  </div>
                </div>

                <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isResetting}
                      className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/20"
                    >
                      {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save New Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {status === 'success' && (
              <div className="py-4">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Password Reset Complete!</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{message}</p>
                <button
                  onClick={handleDismiss}
                  className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
                >
                  Proceed to Sign In
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="py-4">
                <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Reset Failed</h3>
                <p className="text-xs text-rose-300 mt-2 leading-relaxed">{message}</p>
                <button
                  onClick={handleDismiss}
                  className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
