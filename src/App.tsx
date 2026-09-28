import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { EmailVerificationBanner } from './components/EmailVerificationBanner';
import { AuthCard } from './components/AuthCard';
import { Dashboard } from './components/Dashboard';
import { ToastContainer } from './components/ToastContainer';
import { VerificationModal } from './components/VerificationModal';
import { FirebaseInfoModal } from './components/FirebaseInfoModal';
import { ActionCodeHandler } from './components/ActionCodeHandler';
import { 
  ShieldCheck, 
  MailCheck, 
  Lock, 
  Key, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { firebaseConfig } from './firebase';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [showVerificationGuide, setShowVerificationGuide] = useState(false);
  const [showProjectInfo, setShowProjectInfo] = useState(false);
  const [lastRegisteredEmail, setLastRegisteredEmail] = useState<string>('');

  const handleRegistered = (email: string) => {
    setLastRegisteredEmail(email);
    setShowVerificationGuide(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-sky-500/20 mb-4 animate-pulse">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
          <span>Initializing Firebase Auth...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Action Code Handler: catches incoming ?mode=verifyEmail&oobCode=... links */}
      <ActionCodeHandler />

      {/* Top Navbar */}
      <Navbar onOpenProjectInfo={() => setShowProjectInfo(true)} />

      {/* Verification Alert Banner (when user is unverified) */}
      <EmailVerificationBanner onOpenHelp={() => setShowVerificationGuide(true)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {user ? (
          <Dashboard onOpenVerificationGuide={() => setShowVerificationGuide(true)} />
        ) : (
          <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Value Proposition & Feature Showcase */}
              <div className="lg:col-span-6 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Firebase Authentication Engine</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Secure User Management &{' '}
                  <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                    Email Verification
                  </span>
                </h1>

                <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
                  Robust, enterprise-grade authentication powered by Firebase Auth. Register accounts, automate email verification workflows, handle password recovery, and secure sessions seamlessly.
                </p>

                {/* Core Security Features Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                      <MailCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Email Verification</div>
                      <div className="text-[11px] text-slate-400">Automated dispatch & token handler</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Encrypted Passwords</div>
                      <div className="text-[11px] text-slate-400">Bcrypt-grade Firebase hashing</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Password Recovery</div>
                      <div className="text-[11px] text-slate-400">Self-serve secure reset links</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">OAuth & Google Sign-In</div>
                      <div className="text-[11px] text-slate-400">One-click secure popup flow</div>
                    </div>
                  </div>
                </div>

                {/* Project Badge */}
                <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
                  <span className="text-slate-500">Connected Project:</span>
                  <button
                    onClick={() => setShowProjectInfo(true)}
                    className="flex items-center gap-1 font-mono text-sky-400 hover:text-sky-300 underline"
                  >
                    <span>{firebaseConfig.projectId}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Right Column: Authentication Form Card */}
              <div className="lg:col-span-6 flex justify-center">
                <AuthCard onRegistered={handleRegistered} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>AuthShield</span>
            <span>•</span>
            <span className="font-mono text-slate-500">Firebase Auth SDK v11</span>
          </div>
          <button
            onClick={() => setShowProjectInfo(true)}
            className="text-slate-500 hover:text-slate-400 transition-colors"
          >
            Firebase Config &amp; Credentials
          </button>
        </div>
      </footer>

      {/* Global Modals */}
      <VerificationModal
        isOpen={showVerificationGuide}
        onClose={() => setShowVerificationGuide(false)}
        registeredEmail={lastRegisteredEmail}
      />

      <FirebaseInfoModal
        isOpen={showProjectInfo}
        onClose={() => setShowProjectInfo(false)}
      />

      {/* Global Toast Alert Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
