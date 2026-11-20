import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  DEHRADUN_COLLEGES,
  TENURE_OPTIONS,
  getDiscountedMonthlyRent,
} from '../data/catalog';
import { BLUEPRINT_LIMITS } from '../lib/firebase';
import {
  AccommodationType,
  CartItem,
  PaymentMethod,
  RentalBooking,
  TenureMonths,
} from '../types';
import { ProductImage } from './ProductImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onUpdateTenure: (productId: string, tenure: TenureMonths) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOpenAuth: () => void;
  onOpenRentals: () => void;
}

const DELIVERY_SLOTS = [
  'Tomorrow · 10:00 AM – 1:00 PM',
  'Tomorrow · 2:00 PM – 6:00 PM',
  'Within 48 Hrs · Morning Slot',
  'Weekend · 10:00 AM – 4:00 PM',
];

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onUpdateTenure,
  onRemoveItem,
  onClearCart,
  onOpenAuth,
  onOpenRentals,
}: CartDrawerProps) {
  const { mode, profile, isEmailUnverified, enterDemoMode, createBooking } = useAuth();

  const [step, setStep] = useState<'bag' | 'checkout' | 'confirmed'>('bag');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [college, setCollege] = useState(DEHRADUN_COLLEGES[0]);
  const [accommodationType, setAccommodationType] = useState<AccommodationType>('PG');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('Dehradun');
  const [deliverySlot, setDeliverySlot] = useState(DELIVERY_SLOTS[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI / QR');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<RentalBooking | null>(null);

  useEffect(() => {
    if (profile) {
      setCustomerName(profile.fullName || '');
      setCustomerMobile(profile.mobile || '');
      setCollege(profile.college || DEHRADUN_COLLEGES[0]);
      setAccommodationType(profile.accommodationType || 'PG');
      setDeliveryAddress(profile.deliveryAddress || '');
      setCity(profile.city || 'Dehradun');
    }
  }, [profile]);

  useEffect(() => {
    if (!isOpen && step === 'confirmed') {
      setStep('bag');
      setConfirmedBooking(null);
    }
  }, [isOpen, step]);

  if (!isOpen) return null;

  const monthlyRentTotal = items.reduce(
    (sum, item) =>
      sum + getDiscountedMonthlyRent(item.product.monthlyRent, item.tenureMonths) * item.quantity,
    0,
  );
  const securityDepositTotal = items.reduce(
    (sum, item) => sum + item.product.securityDeposit * item.quantity,
    0,
  );
  const deliveryFee = monthlyRentTotal >= 600 || items.length === 0 ? 0 : 149;
  const totalPayableNow = monthlyRentTotal + securityDepositTotal + deliveryFee;
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const primaryTenure: TenureMonths = items[0]?.tenureMonths ?? 6;

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (customerName.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!BLUEPRINT_LIMITS.mobile.pattern.test(customerMobile.trim())) {
      setErrorMsg('Enter a valid 10-digit mobile number.');
      return;
    }
    if (deliveryAddress.trim().length < 5) {
      setErrorMsg('Please enter your complete Dehradun hostel, PG, or room address.');
      return;
    }
    if (mode === 'none') {
      setErrorMsg('Please sign in or switch to Demo Student Mode to confirm your booking.');
      return;
    }
    if (isEmailUnverified) {
      setErrorMsg(
        'Your email is not verified yet. Please verify your email or use Demo Student Mode below.',
      );
      return;
    }

    setSubmitting(true);
    const summary = items
      .map((i) => `${i.product.name} × ${i.quantity} (${i.tenureMonths}mo)`)
      .join(', ');

    const res = await createBooking({
      customerName,
      customerMobile,
      college,
      accommodationType,
      deliveryAddress,
      city,
      itemsSummary: summary,
      itemCount: totalItemCount,
      tenureMonths: primaryTenure,
      monthlyRent: monthlyRentTotal,
      securityDeposit: securityDepositTotal,
      deliveryFee,
      totalPayableNow,
      paymentMethod,
      deliverySlot,
    });
    setSubmitting(false);

    if (!res.ok || !res.booking) {
      setErrorMsg(res.error || 'Could not confirm booking. Please try again.');
      return;
    }

    setConfirmedBooking(res.booking);
    onClearCart();
    setStep('confirmed');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Rental Bag and Checkout"
    >
      <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              {step === 'bag'
                ? `Rental Bag (${totalItemCount})`
                : step === 'checkout'
                  ? 'Dehradun Delivery & Checkout'
                  : 'Booking Confirmed'}
            </h2>
            <p className="text-xs text-slate-500">
              {step === 'confirmed'
                ? 'Your verified Dehradun student rental order'
                : 'Free assembly · 100% refundable security deposit'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close rental bag"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'confirmed' && confirmedBooking ? (
            <div className="space-y-6">
              <div className="rounded-2xl bg-[#DCFCE7] border border-[#15803D]/25 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[#15803D] text-white flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-xs font-semibold text-[#15803D] mb-1">
                  Booking Successful
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 mb-1">
                  Order {confirmedBooking.orderNumber} Confirmed
                </h3>
                <p className="text-sm text-slate-700">
                  Scheduled for {confirmedBooking.deliverySlot}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Student</span>
                  <span className="font-medium text-slate-900 text-right">
                    {confirmedBooking.customerName} ({confirmedBooking.accommodationType})
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Delivery Address</span>
                  <span className="font-medium text-slate-900 text-right max-w-[240px]">
                    {confirmedBooking.deliveryAddress}, {confirmedBooking.city}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Items</span>
                  <span className="font-medium text-slate-900 text-right max-w-[240px]">
                    {confirmedBooking.itemsSummary}
                  </span>
                </div>
                <div className="flex justify-between gap-3 pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Monthly Rent</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    ₹{confirmedBooking.monthlyRent}/mo
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Total Paid / Due on Delivery</span>
                  <span className="font-bold text-[#15803D] tabular-nums">
                    ₹{confirmedBooking.totalPayableNow.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRentals();
                  }}
                  className="w-full py-3 rounded-xl bg-[#663399] text-white text-sm font-semibold hover:bg-[#532680] transition-colors cursor-pointer min-h-[44px]"
                >
                  View in My Rentals
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 cursor-pointer min-h-[44px]"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-[#EDE5F7] text-[#663399] flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-1">
                Your rental bag is empty
              </h3>
              <p className="text-sm text-slate-500 max-w-xs mb-6">
                Explore affordable study tables, beds, coolers, and appliances ready for 48-hour Dehradun delivery.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#663399] text-white text-sm font-semibold hover:bg-[#532680] cursor-pointer min-h-[44px]"
              >
                Browse Products
              </button>
            </div>
          ) : step === 'bag' ? (
            <div className="space-y-4">
              {items.map((item) => {
                const unitRent = getDiscountedMonthlyRent(
                  item.product.monthlyRent,
                  item.tenureMonths,
                );
                return (
                  <div
                    key={item.product.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-white flex gap-4"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F4F2F8] shrink-0">
                      <ProductImage
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        focus={item.product.imageFocus}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-sm font-semibold text-slate-900 truncate">
                          {item.product.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.product.id)}
                          aria-label={`Remove ${item.product.name}`}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs text-slate-500 mb-2.5 tabular-nums">
                        ₹{unitRent}/mo · Deposit ₹{item.product.securityDeposit}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <select
                          aria-label={`Rental tenure for ${item.product.name}`}
                          value={item.tenureMonths}
                          onChange={(e) =>
                            onUpdateTenure(
                              item.product.id,
                              Number(e.target.value) as TenureMonths,
                            )
                          }
                          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#663399]"
                        >
                          {TENURE_OPTIONS.map((t) => (
                            <option key={t.months} value={t.months}>
                              {t.label}
                            </option>
                          ))}
                        </select>

                        <div className="inline-flex items-center border border-slate-200 rounded-lg">
                          <button
                            type="button"
                            aria-label="Decrease item quantity"
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase item quantity"
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <form id="checkout-form" onSubmit={handleConfirmBooking} className="space-y-4">
              {mode === 'none' && (
                <div className="p-4 rounded-xl bg-[#EDE5F7]/70 border border-[#663399]/20 space-y-2.5">
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Sign in to sync bookings to your account, or start instant Demo Student Mode for testing.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className="px-3.5 py-2 rounded-lg bg-[#663399] text-white text-xs font-semibold cursor-pointer"
                    >
                      Sign In / Register
                    </button>
                    <button
                      type="button"
                      onClick={() => enterDemoMode()}
                      className="px-3.5 py-2 rounded-lg bg-white border border-[#663399]/30 text-[#663399] text-xs font-semibold cursor-pointer"
                    >
                      Use Demo Student Mode
                    </button>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Vaishali Singh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#663399]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#663399]"
                  />
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
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Hostel / PG / Room Delivery Address
                </label>
                <textarea
                  rows={2}
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Room number, PG/Hostel name, landmark (e.g. Prem Nagar, Dehradun)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#663399]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Preferred Delivery Slot
                  </label>
                  <select
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#663399]"
                  >
                    {DELIVERY_SLOTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#663399]"
                  >
                    <option value="UPI / QR">UPI / QR</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Campus Pay Later">Campus Pay Later</option>
                  </select>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Sticky Footer Breakdown */}
        {items.length > 0 && step !== 'confirmed' && (
          <div className="border-t border-slate-200 p-6 bg-slate-50/80 space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Monthly Rental Subtotal</span>
                <span className="font-medium text-slate-900 tabular-nums">
                  ₹{monthlyRentTotal.toLocaleString('en-IN')}/mo
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Refundable Security Deposit</span>
                <span className="font-medium text-slate-900 tabular-nums">
                  ₹{securityDepositTotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery & Room Setup</span>
                <span className="font-medium text-emerald-700 tabular-nums">
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-bold text-slate-900">
                <span>Total Due (1st Mo + Deposit)</span>
                <span className="text-[#663399] tabular-nums">
                  ₹{totalPayableNow.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {step === 'bag' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 rounded-xl bg-[#663399] text-white text-sm font-semibold hover:bg-[#532680] transition-colors cursor-pointer min-h-[44px]"
              >
                Proceed to Dehradun Checkout
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('bag')}
                  className="px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 cursor-pointer min-h-[44px]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="flex-1 py-3.5 rounded-xl bg-[#663399] text-white text-sm font-semibold hover:bg-[#532680] disabled:opacity-60 transition-colors cursor-pointer min-h-[44px]"
                >
                  {submitting ? 'Confirming Booking...' : 'Confirm Rental Booking'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
