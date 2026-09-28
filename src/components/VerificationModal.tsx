import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MailCheck, 
  X, 
  Send, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  HelpCircle,
  Copy
} from 'lucide-react';
import { auth, applyActionCode, firebaseConfig } from '../firebase';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredEmail?: string;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  registeredEmail
}) => {
  const { user, refreshUser, sendVerificationEmail, resendCooldown, addToast, emailVerified } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  if (!isOpen) return null;

  const currentEmail = registeredEmail || user?.email || '';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const verified = await refreshUser();
    setIsRefreshing(false);
    if (verified) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await sendVerificationEmail();
    } finally {
      setIsResending(false);
    }
  };

  const handleApplyManualCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setIsApplyingCode(true);
    try {
      // In case user pasted an entire URL with oobCode=
      let codeToApply = manualCode.trim();
      if (codeToApply.includes('oobCode=')) {
        const urlParams = new URLSearchParams(codeToApply.split('?')[1]);
        codeToApply = urlParams.get('oobCode') || codeToApply;
      }

      await applyActionCode(auth, codeToApply);
      await refreshUser();
      addToast({
        type: 'success',
        title: 'Email Verified Successfully!',
        message: 'Your verification action code was verified.'
      });
      setManualCode('');
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Invalid or Expired Code',
        message: err.message || 'Could not verify this action code.'
      });
    } finally {
      setIsApplyingCode(false);
    }
  };

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleCopyHostname = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <MailCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Email Verification Guide</h3>
            <p className="text-xs text-slate-400">Firebase Auth Secure User Management</p>
          </div>
        </div>

        {emailVerified ? (
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 text-center my-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Email Address is Verified!</h4>
            <p className="text-xs text-emerald-300 mt-1">
              Your account has full access and verified status.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Target email */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400">Verification recipient:</span>
              <span className="text-xs font-mono font-medium text-sky-400 truncate max-w-[240px]">
                {currentEmail || 'Registered Email'}
              </span>
            </div>

            {/* Steps list */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Steps to complete verification:
              </h4>

              <div className="flex items-start gap-3 bg-slate-800/40 p-3 rounded-lg border border-slate-800/80">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-xs text-slate-300">
                  Open your email inbox and look for an email from{' '}
                  <span className="text-white font-mono font-medium">noreply@{firebaseConfig.projectId}.firebaseapp.com</span>.
                </p>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/40 p-3 rounded-lg border border-slate-800/80">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-xs text-slate-300">
                  <strong className="text-white">Check Spam/Junk folder:</strong> Automated verification emails can occasionally land in Spam or Promotions folders.
                </p>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/40 p-3 rounded-lg border border-slate-800/80">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-xs text-slate-300">
                  Click the link inside the email to verify. Once clicked, return here and tap{' '}
                  <strong className="text-white">"Check Status"</strong> below.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg shadow-sky-600/20"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Checking...' : 'Check Verification Status'}</span>
              </button>

              {user && (
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isResending}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                    resendCooldown > 0 || isResending
                      ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isResending
                      ? 'Sending...'
                      : resendCooldown > 0
                      ? `Resend (${resendCooldown}s)`
                      : 'Resend Email'}
                  </span>
                </button>
              )}
            </div>

            {/* Quick Action Code Form for advanced testing */}
            <div className="pt-2 border-t border-slate-800">
              <details className="group">
                <summary className="text-[11px] font-medium text-slate-400 hover:text-slate-300 cursor-pointer flex items-center gap-1.5 list-none select-none">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>Developer / Direct Action Code Verification</span>
                  <span className="ml-auto text-[10px] text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-3 space-y-2.5 text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-[11px] leading-relaxed">
                    If you copy the verification link from the email or have the action code (<code className="text-amber-400">oobCode</code>), you can paste it directly below:
                  </p>
                  <form onSubmit={handleApplyManualCode} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste oobCode or verification link..."
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCode || !manualCode.trim()}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      {isApplyingCode ? 'Verifying...' : 'Verify Code'}
                    </button>
                  </form>

                  {currentHostname && (
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                      <span>Authorized Domain for Firebase:</span>
                      <button
                        type="button"
                        onClick={handleCopyHostname}
                        className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-mono"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedDomain ? 'Copied!' : 'Copy Hostname'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
