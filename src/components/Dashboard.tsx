import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User as UserIcon, 
  Shield, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  KeyRound, 
  Copy, 
  Check, 
  Send, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  Lock, 
  Eye, 
  EyeOff, 
  Calendar, 
  Clock, 
  Fingerprint, 
  ExternalLink,
  Sparkles,
  HelpCircle,
  Mail
} from 'lucide-react';
import { firebaseConfig } from '../firebase';

interface DashboardProps {
  onOpenVerificationGuide: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenVerificationGuide }) => {
  const { 
    user, 
    emailVerified, 
    refreshUser, 
    sendVerificationEmail, 
    resendCooldown, 
    updateDisplayName, 
    updateAvatar, 
    changePassword, 
    deleteAccount,
    addToast 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'security' | 'diagnostics'>('overview');

  // Edit Name State
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [savingName, setSavingName] = useState(false);

  // Change Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  // Avatar Selection State
  const [customAvatarSeed, setCustomAvatarSeed] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);

  // Delete Account Confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Utility states
  const [copiedUid, setCopiedUid] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResending, setIsResending] = useState(false);

  if (!user) return null;

  const handleCopyUid = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    await refreshUser();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await sendVerificationEmail();
    } finally {
      setIsResending(false);
    }
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSavingName(true);
    try {
      await updateDisplayName(newName.trim());
      setEditingName(false);
    } catch {
      // toast shown in context
    } finally {
      setSavingName(false);
    }
  };

  const handleSaveAvatar = async (seed: string) => {
    setSavingAvatar(true);
    const url = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}`;
    try {
      await updateAvatar(url);
    } catch {
      // toast in context
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast({
        type: 'error',
        title: 'Short Password',
        message: 'Password must be at least 6 characters.'
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast({
        type: 'error',
        title: 'Password Mismatch',
        message: 'New password and confirmation do not match.'
      });
      return;
    }

    setChangingPass(true);
    try {
      await changePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      // toast in context
    } finally {
      setChangingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch {
      // toast in context
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Avatar presets
  const avatarSeeds = ['Felix', 'Luna', 'Jasper', 'Milo', 'Zoe', 'Shadow', 'Oliver'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* User Header Profile Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative group">
              <img
                src={
                  user.photoURL ||
                  `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.uid)}`
                }
                alt={user.displayName || 'User Avatar'}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 border-slate-700 bg-slate-950 object-cover shadow-xl"
              />
              <button
                onClick={() => setActiveTab('settings')}
                className="absolute inset-0 bg-slate-950/70 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium"
              >
                Change
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {user.displayName || 'Registered User'}
                </h1>
                {/* Verification Badge */}
                {emailVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Account
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Unverified Email
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1 text-slate-400 text-xs sm:text-sm font-mono">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-200">{user.email}</span>
              </div>

              {/* UID info with copy */}
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                <Fingerprint className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px] truncate max-w-[140px] sm:max-w-[220px]">
                  UID: {user.uid}
                </span>
                <button
                  onClick={handleCopyUid}
                  className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                  title="Copy User UID"
                >
                  {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-end">
            {!emailVerified && (
              <button
                onClick={handleResendVerification}
                disabled={resendCooldown > 0 || isResending}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-900/40 disabled:text-amber-500/50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isResending
                    ? 'Sending...'
                    : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend Verification'}
                </span>
              </button>
            )}

            <button
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 mt-6 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview & Security
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Profile & Password
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'diagnostics'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Email Verification Lab
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & SECURITY */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Email Verification Status */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Status
              </span>
              {emailVerified ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}
            </div>

            <div>
              <div className="text-xl font-bold text-white">
                {emailVerified ? 'Verified' : 'Pending Verification'}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {emailVerified
                  ? 'Your identity is confirmed. Firebase Auth will allow all email-verified protected operations.'
                  : 'An action link was emailed to you. Please confirm your email address to unlock security guarantees.'}
              </p>
            </div>

            {!emailVerified ? (
              <div className="pt-2">
                <button
                  onClick={onOpenVerificationGuide}
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>How to Verify Email</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Email address verified & securely bound to Firebase UID.</span>
              </div>
            )}
          </div>

          {/* Card 2: Authentication Metadata */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Session & Activity
              </span>
              <Clock className="w-5 h-5 text-indigo-400" />
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500">Account Created</div>
                <div className="text-xs font-medium text-slate-200 mt-0.5">
                  {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleString() : 'N/A'}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Last Sign-in</div>
                <div className="text-xs font-medium text-slate-200 mt-0.5">
                  {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'N/A'}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Auth Providers</div>
                <div className="flex items-center gap-1.5 mt-1">
                  {user.providerData.map((provider) => (
                    <span
                      key={provider.providerId}
                      className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-[11px] font-mono text-sky-400"
                    >
                      {provider.providerId}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Security Scorecard */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Security Checklist
              </span>
              <ShieldCheck className="w-5 h-5 text-sky-400" />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">Email Verified</span>
                {emailVerified ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Yes
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> No
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">Firebase SSL Channel</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Encrypted
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">Firebase Project</span>
                <span className="font-mono text-[11px] text-slate-300 truncate max-w-[120px]">
                  {firebaseConfig.projectId}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFILE & PASSWORD SETTINGS */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Change Display Name */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-bold text-white">Update Display Name</h3>
            </div>
            <p className="text-xs text-slate-400">
              Change how your name is displayed across the application.
            </p>

            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingName || !newName.trim()}
                className="py-2.5 px-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-600/20 transition-colors"
              >
                {savingName ? 'Saving...' : 'Save Display Name'}
              </button>
            </form>

            {/* Avatar preset picker */}
            <div className="pt-4 border-t border-slate-800">
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Choose an Avatar Seed
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {avatarSeeds.map((seed) => (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => handleSaveAvatar(seed)}
                    className="p-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 transition-transform active:scale-95"
                    title={`Use ${seed}`}
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`}
                      alt={seed}
                      className="w-9 h-9 rounded-lg"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Change Account Password</h3>
            </div>
            <p className="text-xs text-slate-400">
              Update your account password. Choose a strong combination of letters and numbers.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={changingPass || !newPassword}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-colors"
              >
                {changingPass ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Danger Zone: Delete Account */}
          <div className="col-span-1 md:col-span-2 bg-rose-950/20 border border-rose-900/40 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <Trash2 className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Danger Zone</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Permanently delete your account and all associated Firebase authentication data. This action is irreversible.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="py-2.5 px-4 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold rounded-xl transition-all"
              >
                Delete Account
              </button>
            ) : (
              <div className="p-4 bg-slate-950 rounded-2xl border border-rose-900/60 space-y-3">
                <p className="text-xs text-rose-300">
                  Please type <strong className="text-white">DELETE</strong> to confirm deletion of account for {user.email}:
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder="Type DELETE"
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmationText !== 'DELETE' || isDeleting}
                    className="py-2 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Permanently'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmationText('');
                    }}
                    className="py-2 px-3 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EMAIL VERIFICATION LAB */}
      {activeTab === 'diagnostics' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-sky-400">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Firebase Email Verification Lab</h3>
              <p className="text-xs text-slate-400">
                How Firebase Auth handles email deliverability, action codes, and verification status.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                How It Works Under the Hood
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                When a user registers or requests verification, Firebase Auth generates a secure, single-use, time-limited cryptographic token (<code className="text-amber-300 font-mono">oobCode</code>).
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                <li>Firebase sends an email to the user's provided email address.</li>
                <li>The link redirects to the Firebase Auth handler or the app's custom action handler.</li>
                <li>Once the user confirms, Firebase flips <code className="text-sky-300 font-mono">emailVerified: true</code> in the secure token claims.</li>
                <li>The client application reloads the user via <code className="text-sky-300 font-mono">await user.reload()</code> to synchronously sync verification state.</li>
              </ul>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Live Verification Status
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Current User Email:</span>
                  <span className="font-mono text-white">{user.email}</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Verified Flag:</span>
                  <span className={`font-mono font-bold ${emailVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {emailVerified ? 'TRUE (Verified)' : 'FALSE (Unverified)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Active Firebase Project:</span>
                  <span className="font-mono text-slate-300">{firebaseConfig.projectId}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={onOpenVerificationGuide}
                  className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Open Verification Guide
                </button>
                <button
                  onClick={handleRefreshStatus}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                >
                  Reload Auth State
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
