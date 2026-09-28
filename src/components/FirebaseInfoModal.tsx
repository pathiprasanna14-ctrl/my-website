import React, { useState } from 'react';
import { firebaseConfig } from '../firebase';
import { X, Copy, Check, ExternalLink, ShieldCheck, Database, Server, Globe } from 'lucide-react';

interface FirebaseInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseInfoModal: React.FC<FirebaseInfoModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Firebase Project Environment</h3>
            <p className="text-xs text-slate-400">Configured credentials & authorized domain status</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Status summary */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Project ID</span>
              <span className="font-mono text-white font-medium">{firebaseConfig.projectId}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Auth Domain</span>
              <span className="font-mono text-sky-400">{firebaseConfig.authDomain}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">App ID</span>
              <span className="font-mono text-slate-300 truncate max-w-[200px]">{firebaseConfig.appId}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Measurement ID</span>
              <span className="font-mono text-slate-300">{firebaseConfig.measurementId}</span>
            </div>
          </div>

          {/* Current Domain Setup Hint */}
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
              <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Current App Domain (Authorized Domains)</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              If Firebase returns an <code className="text-amber-300">auth/unauthorized-domain</code> error during Google Sign-in or Action links, add this domain to the Firebase Console:
            </p>
            <div className="flex items-center justify-between bg-slate-900 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white">
              <span className="truncate max-w-[340px]">{currentHostname}</span>
              <button
                onClick={() => handleCopy(currentHostname, 'hostname')}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-sans ml-2"
              >
                {copiedKey === 'hostname' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'hostname' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Setup verification checklist */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Firebase Auth Feature Checklist
            </h4>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>
                <strong className="text-white">Email/Password Authentication:</strong> Enabled in Firebase Auth &gt; Sign-in method.
              </li>
              <li>
                <strong className="text-white">Email Verification:</strong> Triggered on new user sign-up via <code className="text-sky-300 font-mono">sendEmailVerification()</code>.
              </li>
              <li>
                <strong className="text-white">Password Reset:</strong> Available via <code className="text-sky-300 font-mono">sendPasswordResetEmail()</code>.
              </li>
              <li>
                <strong className="text-white">In-App Action Code Handler:</strong> Captures incoming action codes and verifies emails or resets passwords directly in the UI.
              </li>
            </ul>
          </div>

          {/* Firebase Console link */}
          <a
            href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <span>Open Firebase Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
