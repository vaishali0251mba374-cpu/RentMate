import React, { useEffect, useState } from 'react';
import { CheckCircle2, LogOut, MailCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEHRADUN_COLLEGES } from '../data/catalog';
import { validateProfileFields } from '../lib/firebase';
import { AccommodationType } from '../types';

interface ProfileViewProps {
  onNavigateRentals: () => void;
  onLoggedOut: () => void;
}

export function ProfileView({ onNavigateRentals, onLoggedOut }: ProfileViewProps) {
  const {
    mode,
    firebaseUser,
    profile,
    isEmailUnverified,
    resendVerificationEmail,
    refreshVerification,
    enterDemoMode,
    saveProfile,
    logout,
  } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [college, setCollege] = useState(DEHRADUN_COLLEGES[0]);
  const [accommodationType, setAccommodationType] = useState<AccommodationType>('PG');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('Dehradun');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.fullName || firebaseUser?.displayName || '');
    setEmail(profile?.email || firebaseUser?.email || '');
    setMobile(profile?.mobile || '');
    setCollege(profile?.college || DEHRADUN_COLLEGES[0]);
    setAccommodationType(profile?.accommodationType || 'PG');
    setDeliveryAddress(profile?.deliveryAddress || '');
    setCity(profile?.city || 'Dehradun');
  }, [profile, firebaseUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const errs = validateProfileFields({
      fullName,
      email,
      mobile,
      college,
      accommodationType,
      deliveryAddress,
      city,
    });
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    const res = await saveProfile({
      fullName,
      email,
      mobile,
      college,
      accommodationType,
      deliveryAddress,
      city,
    });
    setSaving(false);

    if (!res.ok) {
      setStatusMessage({ type: 'error', text: res.error || 'Could not update profile.' });
      return;
    }

    setStatusMessage({
      type: 'success',
      text:
        mode === 'demo'
          ? 'Demo student profile updated for this session.'
          : 'Student profile saved securely to Firebase Firestore.',
    });
  };

  const handleLogout = async () => {
    await logout();
    onLoggedOut();
  };

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs text-slate-500 mb-1">
            {mode === 'demo'
              ? 'Demo Student Mode · Local Session'
              : 'Firebase Authenticated Profile'}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Student Profile & Delivery Settings
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateRentals}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer min-h-[40px]"
          >
            My Rentals
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-white text-sm font-medium text-red-700 hover:bg-red-50 cursor-pointer min-h-[40px]"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {isEmailUnverified && (
        <div className="mb-6 p-5 rounded-2xl bg-[#EDE5F7]/75 border border-[#663399]/25 space-y-3">
          <div className="flex items-start gap-3">
            <MailCheck className="w-5 h-5 text-[#663399] shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display text-sm font-bold text-slate-900">
                Verify your email address to enable cloud Firestore sync
              </h2>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                We sent a verification link to {firebaseUser?.email}. Once verified, click Refresh Status—or switch to Demo Student Mode to test bookings immediately.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={async () => {
                const ok = await refreshVerification();
                setStatusMessage(
                  ok
                    ? { type: 'success', text: 'Email verified! Cloud profile is active.' }
                    : { type: 'error', text: 'Verification link not clicked yet.' },
                );
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#663399] text-white text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Status
            </button>
            <button
              type="button"
              onClick={() => void resendVerificationEmail()}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer"
            >
              Resend Verification Email
            </button>
            <button
              type="button"
              onClick={() => enterDemoMode({ fullName, email, mobile, college, accommodationType, deliveryAddress, city })}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#663399]/30 text-xs font-semibold text-[#663399] cursor-pointer"
            >
              Use Demo Mode Instead
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs"
      >
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl border text-sm flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-[#DCFCE7] border-[#15803D]/25 text-[#15803D]'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#663399]"
            />
            {fieldErrors.fullName && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              readOnly={mode === 'firebase'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#663399] ${
                mode === 'firebase' ? 'bg-slate-50 text-slate-500' : ''
              }`}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Delivery Address
          </label>
          <textarea
            rows={2}
            required
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Hostel block, PG name, room number & locality in Dehradun"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#663399]"
          />
          {fieldErrors.deliveryAddress && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.deliveryAddress}</p>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-[#663399] text-white text-sm font-semibold hover:bg-[#532680] disabled:opacity-60 transition-colors cursor-pointer min-h-[44px]"
          >
            {saving ? 'Saving Profile...' : 'Save Student Profile'}
          </button>
        </div>
      </form>
    </section>
  );
}
