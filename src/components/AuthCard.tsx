import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  KeyRound,
  Check,
  Send
} from 'lucide-react';

interface AuthCardProps {
  onRegistered: (email: string) => void;
}

type TabType = 'login' | 'register' | 'forgot';

export const AuthCard: React.FC<AuthCardProps> = ({ onRegistered }) => {
  const { login, register, loginWithGoogle, sendPasswordReset } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Password strength calculation
  const passwordCriteria = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.minLength) score += 20;
    if (passwordCriteria.hasUpper) score += 20;
    if (passwordCriteria.hasLower) score += 20;
    if (passwordCriteria.hasNumber) score += 20;
    if (passwordCriteria.hasSpecial) score += 20;
    return score;
  }, [passwordCriteria]);

  const strengthColor = useMemo(() => {
    if (passwordScore < 40) return 'bg-rose-500';
    if (passwordScore < 60) return 'bg-amber-500';
    if (passwordScore < 80) return 'bg-sky-500';
    return 'bg-emerald-500';
  }, [passwordScore]);

  const strengthLabel = useMemo(() => {
    if (password.length === 0) return '';
    if (passwordScore < 40) return 'Weak';
    if (passwordScore < 60) return 'Fair';
    if (passwordScore < 80) return 'Good';
    return 'Strong';
  }, [passwordScore, password.length]);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      await login(email, password);
    } catch {
      // Handled in context toast
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    if (!agreeTerms) {
      alert('Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, displayName);
      onRegistered(email);
    } catch {
      // Handled in context toast
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setLoading(true);
    try {
      await sendPasswordReset(resetEmail);
      setResetSent(true);
    } catch {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Auth
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      // Handled in context
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Container Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        {/* Glow decorations */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800/80 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setResetSent(false);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'login'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setResetSent(false);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'register'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Header Title */}
        <div className="mb-6 text-center">
          {activeTab === 'login' && (
            <>
              <h2 className="text-xl font-bold text-white tracking-tight">Welcome Back</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials to securely access your account.
              </p>
            </>
          )}
          {activeTab === 'register' && (
            <>
              <h2 className="text-xl font-bold text-white tracking-tight">Register an Account</h2>
              <p className="text-xs text-slate-400 mt-1">
                Create your account and verify your email address.
              </p>
            </>
          )}
          {activeTab === 'forgot' && (
            <>
              <h2 className="text-xl font-bold text-white tracking-tight">Recover Password</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your registered email to receive password reset instructions.
              </p>
            </>
          )}
        </div>

        {/* Quick Google Provider Sign-in */}
        {activeTab !== 'forgot' && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-950 hover:bg-slate-800/90 text-white border border-slate-700/80 rounded-xl text-xs font-semibold transition-all hover:border-slate-600 disabled:opacity-50 shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.64v3.03h3.88c2.28-2.09 3.66-5.18 3.66-9.11z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-slate-900 px-3 text-slate-500 font-semibold">Or continue with email</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: SIGN IN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <span>{loading ? 'Signing In...' : 'Sign In to Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Tab 2: REGISTER FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Create Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-slate-500 hover:text-slate-300 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength progress */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Password Strength:</span>
                    <span className="font-semibold text-slate-200">{strengthLabel}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strengthColor} transition-all duration-300`}
                      style={{ width: `${passwordScore}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full bg-slate-950 border rounded-xl pl-10 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-700/80 focus:border-sky-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2 text-slate-500 hover:text-slate-300 p-0.5"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[10px] text-rose-400 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Email verification notice */}
            <div className="bg-sky-950/40 border border-sky-500/20 rounded-xl p-2.5 text-[11px] text-sky-300 flex items-start gap-2">
              <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
              <span>A verification email will be automatically sent to confirm your address upon creation.</span>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500 w-3.5 h-3.5"
              />
              <span className="text-[11px] text-slate-400">
                I agree to the <span className="text-white underline">Terms of Service</span> and acknowledge the <span className="text-white underline">Privacy Policy</span>.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account & Send Verification'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Tab 3: FORGOT PASSWORD FORM */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            {resetSent ? (
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white">Reset Link Dispatched</h4>
                <p className="text-[11px] text-emerald-300">
                  We sent instructions to <strong className="text-white">{resetEmail}</strong>. Check your inbox and spam folder.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setResetSent(false);
                  }}
                  className="mt-2 text-xs text-sky-400 hover:text-sky-300 underline font-medium"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Your Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Sending...' : 'Send Password Reset Link'}</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>

      {/* Security note below card */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Firebase Auth Protected with End-to-End SSL</span>
      </div>
    </div>
  );
};
