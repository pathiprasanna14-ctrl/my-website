import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, CheckCircle, AlertTriangle, LogOut, KeyRound, Sparkles } from 'lucide-react';
import { firebaseConfig } from '../firebase';

interface NavbarProps {
  onOpenProjectInfo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProjectInfo }) => {
  const { user, emailVerified, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-amber-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight">AuthShield</span>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Firebase
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block truncate max-w-[200px]">
              {firebaseConfig.projectId}
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenProjectInfo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
            title="Inspect Firebase Auth Configuration"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Firebase Info</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Verification status badge */}
              <div
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  emailVerified
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {emailVerified ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Unverified</span>
                  </>
                )}
              </div>

              {/* User Avatar & Name */}
              <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
                <img
                  src={
                    user.photoURL ||
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.uid)}`
                  }
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-slate-700 object-cover bg-slate-800"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-white truncate max-w-[120px]">
                    {user.displayName || 'User'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Sign out button */}
              <button
                onClick={logout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Auth Ready
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
