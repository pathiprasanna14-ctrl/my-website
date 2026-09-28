import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Send, RefreshCw, HelpCircle, CheckCircle2, Mail } from 'lucide-react';

interface EmailVerificationBannerProps {
  onOpenHelp: () => void;
}

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ onOpenHelp }) => {
  const { user, emailVerified, sendVerificationEmail, refreshUser, resendCooldown } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!user || emailVerified) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUser();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleResend = async () => {
    setIsSending(true);
    try {
      await sendVerificationEmail();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-orange-950/80 border-b border-amber-600/30 text-amber-200 px-4 py-3 shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Banner content */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            <Mail className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Email Verification Required</h3>
              <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">
                Action Needed
              </span>
            </div>
            <p className="text-xs text-amber-200/90 mt-0.5">
              A verification link was dispatched to <strong className="text-white underline">{user.email}</strong>. Please confirm your email address to secure your account.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || isSending}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              resendCooldown > 0 || isSending
                ? 'bg-amber-900/40 text-amber-400/60 border border-amber-800/40 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold active:scale-95'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isSending
                ? 'Sending...'
                : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend Email'}
            </span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-amber-200 border border-amber-500/40 text-xs font-semibold transition-all active:scale-95"
            title="Check if verified"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>I've Verified (Refresh)</span>
          </button>

          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-amber-300/80 hover:text-white hover:bg-amber-500/10 transition-colors"
            title="Troubleshooting and instructions"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tips</span>
          </button>
        </div>
      </div>
    </div>
  );
};
