import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { resolveAssetUrl } from '../utils/assets.ts';
import { normalizeNigerianPhoneNumber } from '../utils/phone.ts';

interface AuthPageProps {
  initialMode?: 'login' | 'register' | 'forgot-password' | 'reset-password';
  onSuccess: () => void;
  onNavigate: (view: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onSuccess,
  onNavigate,
}) => {
  const { login, register, sendPasswordReset, updatePassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password' | 'reset-password'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Ado-Ekiti');
  const [state, setState] = useState('Ekiti State');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    let normalizedPhone = '';

    if (mode === 'register') {
      const validatedPhone = normalizeNigerianPhoneNumber(phone);
      if (!validatedPhone) {
        setErrorMsg('Enter a valid Nigerian mobile number: 10 digits after +234.');
        return;
      }
      normalizedPhone = validatedPhone;
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-check.');
        return;
      }
    }
    if (mode === 'reset-password' && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if ((mode === 'register' || mode === 'reset-password') && password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-check.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'forgot-password') {
        const result = await sendPasswordReset(email);
        if (!result.success) {
          setErrorMsg(result.error || 'Could not send password reset email.');
          return;
        }
        setInfoMsg('If an account exists for that email, a password reset link will be sent.');
      } else if (mode === 'reset-password') {
        const result = await updatePassword(password);
        if (!result.success) {
          setErrorMsg(result.error || 'Could not update password.');
          return;
        }
        onSuccess();
      } else if (mode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Invalid credentials');
          return;
        }
        onSuccess();
      } else {
        const res = await register({
          fullName,
          email,
          phone: normalizedPhone,
          password,
          address,
          city,
          state,
        });
        if (!res.success) {
          setErrorMsg(res.error || 'Registration failed');
          return;
        }
        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-8">
      {/* Brand Icon & Heading */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-white p-1 border-2 border-[#C9A15B] mx-auto overflow-hidden shadow-sm">
          <img
            src={resolveAssetUrl('/src/assets/images/comfys_glow_logo_1791541553890.jpg')}
            alt="Comfy's Glow Logo"
            className="w-full h-full object-cover rounded-full"
            referrerPolicy="no-referrer"
            decoding="async"
          />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#59172F]">
          {mode === 'login'
            ? 'Welcome Back'
            : mode === 'register'
              ? 'Create Customer Account'
              : mode === 'forgot-password'
                ? 'Reset Your Password'
                : 'Choose a New Password'}
        </h1>
        <p className="text-xs text-[#736B76]">
          {mode === 'login'
            ? 'Sign in to access your orders, track shipments, and manage your wishlist.'
            : mode === 'register'
              ? 'Join Comfy’s Glow for personal order tracking, doorstep delivery, and verified reviews.'
              : mode === 'forgot-password'
                ? 'Enter your email and we’ll send you a password reset link.'
                : 'Set a new password for your Comfy’s Glow account.'}
        </p>
      </div>

      {/* Auth Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCDE] shadow-sm space-y-6">
        {/* Toggle Mode */}
        {(mode === 'login' || mode === 'register') ? (
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
              setInfoMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              mode === 'login' ? 'bg-white text-[#59172F] shadow-xs' : 'text-slate-600'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
              setInfoMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              mode === 'register' ? 'bg-white text-[#59172F] shadow-xs' : 'text-slate-600'
            }`}
          >
            Register
          </button>
        </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
              setInfoMsg('');
            }}
            className="text-xs font-semibold text-[#59172F] hover:text-[#C9A15B]"
          >
            Back to sign in
          </button>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#29232B] mb-1">Full Name *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Joy Bolanle"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A15B]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="registration-phone" className="block text-xs font-semibold text-[#29232B] mb-1">
                  Phone Number *
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:border-[#C9A15B]">
                  <span className="pl-3 pr-2 text-xs font-semibold text-[#59172F]" aria-label="Country code +234">
                    +234
                  </span>
                  <input
                    id="registration-phone"
                    type="tel"
                    required
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    pattern="[789][0-9]{9}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="8031234567"
                    aria-describedby="registration-phone-hint"
                    className="w-full min-w-0 px-3 py-2.5 bg-transparent rounded-r-xl text-xs focus:outline-none"
                  />
                </div>
                <p id="registration-phone-hint" className="mt-1 text-[11px] text-[#736B76]">
                  Enter 10 digits after +234.
                </p>
              </div>
            </>
          )}

          {mode !== 'reset-password' && <div>
            <label className="block text-xs font-semibold text-[#29232B] mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A15B]"
              />
            </div>
          </div>}

          {/* Password Input with Visibility Toggle */}
          {(mode === 'login' || mode === 'register' || mode === 'reset-password') && <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#29232B]">Password *</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-semibold text-[#59172F] hover:text-[#C9A15B] flex items-center gap-1 transition-colors focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-[#59172F]" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-[#C9A15B]" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A15B] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-slate-400 hover:text-[#59172F] absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors focus:outline-none cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>}

          {/* Password confirmation for signup and recovery */}
          {(mode === 'register' || mode === 'reset-password') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#29232B]">Confirm Password *</label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[11px] font-semibold text-[#59172F] hover:text-[#C9A15B] flex items-center gap-1 transition-colors focus:outline-none cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                >
                  {showConfirmPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-[#59172F]" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-[#C9A15B]" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A15B] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1.5 text-slate-400 hover:text-[#59172F] absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors focus:outline-none cursor-pointer"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#29232B] mb-1">Delivery Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, landmark..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A15B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#29232B] mb-1">Town</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ado-Ekiti"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#29232B] mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Ekiti State"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800" role="status">
              {infoMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#59172F] hover:bg-[#431022] text-[#FFF9F2] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading
              ? 'Processing...'
              : mode === 'login'
                ? 'Sign In'
                : mode === 'register'
                  ? 'Create My Account'
                  : mode === 'forgot-password'
                    ? 'Send Reset Link'
                    : 'Update Password'}
          </button>
        </form>

        {mode === 'login' && (
          <button
            type="button"
            onClick={() => {
              setMode('forgot-password');
              setErrorMsg('');
              setInfoMsg('');
            }}
            className="w-full text-xs font-semibold text-[#59172F] hover:text-[#C9A15B]"
          >
            Forgot your password?
          </button>
        )}
      </div>
    </div>
  );
};
