import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEHRADUN_COLLEGES } from '../data/catalog';
import { validateProfileFields } from '../lib/firebase';
import { AccommodationType } from '../types';

interface AuthViewProps {
  onSuccess: () => void;
}

export function AuthView({ onSuccess }: AuthViewProps) {
  const {
    signInWithGoogle,
    signUpWithEmail,
    loginWithEmail,
    enterDemoMode,
  } = useAuth();

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up state (all 8 required fields)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState(DEHRADUN_COLLEGES[0]);
  const [accommodationType, setAccommodationType] = useState<AccommodationType>('PG');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('Dehradun');

  const handleGoogleSignIn = async () => {
    setFormError('');
    setLoading(true);
    const res = await signInWithGoogle();
    setLoading(false);
    if (!res.ok) {
      setFormError(res.error || 'Google sign-in failed.');
      return;
    }
    onSuccess();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const errs: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) {
      errs.loginEmail = 'Enter a valid email address.';
    }
    if (loginPassword.length < 6) {
      errs.loginPassword = 'Password must be at least 6 characters.';
    }
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const res = await loginWithEmail(loginEmail, loginPassword);
    setLoading(false);
    if (!res.ok) {
      setFormError(res.error || 'Login failed.');
      return;
    }
    onSuccess();
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const errs = validateProfileFields({
      fullName,
      email,
      mobile,
      college,
      accommodationType,
      deliveryAddress,
      city,
    });
    if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const res = await signUpWithEmail({
      fullName,
      email,
      mobile,
      password,
      college,
      accommodationType,
      deliveryAddress,
      city,
    });
    setLoading(false);
    if (!res.ok) {
      setFormError(res.error || 'Could not create account.');
      return;
    }
    onSuccess();
  };

  const handleDemoEnter = () => {
    enterDemoMode();
    onSuccess();
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Student Trust Panel */}
        <div className="lg:col-span-5 bg-[#EDE5F7]/65 border border-[#663399]/15 rounded-2xl p-7 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-[#663399] mb-2">
              RentMate Dehradun · Student Access
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
              Your room essentials, booked in minutes
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Sign in with Firebase Authentication to manage your hostel or PG delivery address, track active rentals, and schedule pickups.
            </p>

            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#663399] shrink-0 mt-0.5" />
                <span>Verified student profiles for DGU, Graphic Era, UPES & DIT</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#663399] shrink-0 mt-0.5" />
                <span>Secure Firebase Auth — passwords are never stored in plain text</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#663399] shrink-0 mt-0.5" />
                <span>One-click Demo Student Mode available for instant preview</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-[#663399]/15">
            <div className="text-xs font-semibold text-slate-800 mb-1.5">
              Demo Mode (Instant Evaluation)
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Testing without creating a Firebase account? Explore full bookings, profile editing, and returns in Demo Student Mode.
            </p>
            <button
              type="button"
              onClick={handleDemoEnter}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#663399]/30 text-[#663399] text-sm font-semibold hover:bg-[#F7F4FC] transition-colors cursor-pointer min-h-[42px]"
            >
              Continue in Demo Student Mode
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Auth Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          {/* Segmented Mode Switch */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setFormError('');
                setFieldErrors({});
              }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                tab === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setFormError('');
                setFieldErrors({});
              }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                tab === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Primary Google Sign-In */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer min-h-[44px]"
          >
            <ShieldCheck className="w-4 h-4 text-[#663399]" />
            Continue with Google (Firebase Auth)
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-500">
                or use student email & password
              </span>
            </div>
          </div>

          {formError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed">
              {formError}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="student@dgu.ac.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#663399]"
                />
                {fieldErrors.loginEmail && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.loginEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#663399]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.loginPassword && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.loginPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#663399] text-white text-sm font-semibold hover:bg-[#532680] disabled:opacity-60 transition-colors cursor-pointer min-h-[44px]"
              >
                {loading ? 'Signing in...' : 'Login to RentMate'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Vaishali Singh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#663399]"
                  />
                  {fieldErrors.fullName && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#663399]"
                  />
                  {fieldErrors.mobile && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.mobile}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@dgu.ac.in"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#663399]"
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Password (min 8 characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#663399]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    College / University
                  </label>
                  <select
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#663399]"
                  >
                    {DEHRADUN_COLLEGES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.college && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.college}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Accommodation Type
                  </label>
                  <select
                    value={accommodationType}
                    onChange={(e) =>
                      setAccommodationType(e.target.value as AccommodationType)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#663399]"
                  >
                    <option value="Hostel">Hostel</option>
                    <option value="PG">PG</option>
                    <option value="Rented Room">Rented Room</option>
                  </select>
                  {fieldErrors.accommodationType && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.accommodationType}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Delivery Address (Hostel / PG / Room)
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Room 12, Doon Heights PG, Prem Nagar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#663399]"
                  />
                  {fieldErrors.deliveryAddress && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.deliveryAddress}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Dehradun"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#663399]"
                  />
                  {fieldErrors.city && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.city}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Secured by Firebase Authentication. Passwords are hashed, never stored in plain text.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#663399] text-white text-sm font-semibold hover:bg-[#532680] disabled:opacity-60 transition-colors cursor-pointer min-h-[44px]"
              >
                {loading ? 'Creating Student Account...' : 'Create RentMate Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
