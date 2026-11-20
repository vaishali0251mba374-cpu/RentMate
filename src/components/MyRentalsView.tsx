import { useState } from 'react';
import { Calendar, CheckCircle2, MapPin, Package, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MyRentalsViewProps {
  onExploreCatalogue: () => void;
  onOpenAuth: () => void;
}

export function MyRentalsView({
  onExploreCatalogue,
  onOpenAuth,
}: MyRentalsViewProps) {
  const { mode, bookings, updateBookingStatus, enterDemoMode } = useAuth();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (mode === 'none') {
    return (
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#EDE5F7] text-[#663399] flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">
            Sign in to view your RentMate bookings
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
            Track active student rentals, check refundable deposit receipts, or schedule hassle-free Dehradun pickups.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-6 py-3 rounded-xl bg-[#663399] text-white text-sm font-semibold hover:bg-[#532680] cursor-pointer min-h-[44px]"
            >
              Sign In / Create Account
            </button>
            <button
              type="button"
              onClick={() => enterDemoMode()}
              className="px-6 py-3 rounded-xl border border-[#663399]/30 bg-[#F7F4FC] text-[#663399] text-sm font-semibold hover:bg-[#EDE5F7] cursor-pointer min-h-[44px]"
            >
              Try Demo Student Mode
            </button>
          </div>
        </div>
      </section>
    );
  }

  const handleStatusChange = async (
    bookingId: string,
    nextStatus: 'Return Requested' | 'Cancelled',
  ) => {
    setBusyId(bookingId);
    setFeedback(null);
    const res = await updateBookingStatus(bookingId, nextStatus);
    setBusyId(null);
    if (res.ok) {
      setFeedback(
        nextStatus === 'Return Requested'
          ? 'Pickup scheduled! Our Dehradun logistics team will confirm your return window within 4 hours.'
          : 'Booking cancelled. Any prepaid deposit will be refunded within 48 hours.',
      );
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs text-slate-500 mb-1">
            {mode === 'demo'
              ? 'Demo Mode · Sample + Local Session Bookings'
              : 'Synced with Cloud Firestore'}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            My Rentals & Pickups
          </h1>
        </div>

        <button
          type="button"
          onClick={onExploreCatalogue}
          className="px-5 py-2.5 rounded-xl bg-[#663399] text-white text-sm font-semibold hover:bg-[#532680] cursor-pointer min-h-[40px]"
        >
          Rent More Items
        </button>
      </div>

      {feedback && (
        <div className="mb-6 p-4 rounded-xl bg-[#DCFCE7] border border-[#15803D]/25 text-sm text-[#15803D] flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#EDE5F7] text-[#663399] flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="font-display text-lg font-semibold text-slate-900 mb-1">
            No rental bookings yet
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Add a study desk, mattress, cooler, or fridge to your bag to start your first flexible Dehradun rental.
          </p>
          <button
            type="button"
            onClick={onExploreCatalogue}
            className="px-5 py-2.5 rounded-xl bg-[#663399] text-white text-sm font-semibold hover:bg-[#532680] cursor-pointer min-h-[42px]"
          >
            Explore Catalogue
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isTerminal =
              booking.status === 'Return Requested' || booking.status === 'Cancelled';
            const isPositive =
              booking.status === 'Confirmed' ||
              booking.status === 'Active Rental' ||
              booking.status === 'Scheduled';

            return (
              <article
                key={booking.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mb-1">
                      <span className="font-mono font-semibold text-slate-800 tabular-nums">
                        {booking.orderNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Booked {booking.createdAtLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {booking.tenureMonths} Month Plan
                      </span>
                    </div>
                    <h2 className="font-display text-lg font-semibold text-slate-900">
                      {booking.itemsSummary}
                    </h2>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                      isPositive
                        ? 'bg-[#DCFCE7] text-[#15803D]'
                        : booking.status === 'Return Requested'
                          ? 'bg-[#EDE5F7] text-[#663399]'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {booking.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-3 border-y border-slate-100 text-sm">
                  <div className="flex items-start gap-2.5 text-slate-600">
                    <MapPin className="w-4 h-4 text-[#663399] shrink-0 mt-0.5" />
                    <span className="text-xs leading-relaxed">
                      {booking.deliveryAddress}, {booking.city} ({booking.accommodationType})
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-600">
                    <Calendar className="w-4 h-4 text-[#663399] shrink-0 mt-0.5" />
                    <span className="text-xs leading-relaxed">
                      {booking.deliverySlot} · {booking.paymentMethod}
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-xs text-slate-500">Monthly Rent / Deposit</div>
                    <div className="font-semibold text-slate-900 tabular-nums">
                      ₹{booking.monthlyRent}/mo · Deposit ₹{booking.securityDeposit}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {booking.college}
                  </div>

                  {!isTerminal && (
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        disabled={busyId === booking.id}
                        onClick={() => handleStatusChange(booking.id, 'Return Requested')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#663399]/30 text-[#663399] text-xs font-semibold hover:bg-[#F7F4FC] cursor-pointer min-h-[38px]"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Request Pickup / Return
                      </button>
                      {booking.status === 'Confirmed' && (
                        <button
                          type="button"
                          disabled={busyId === booking.id}
                          onClick={() => handleStatusChange(booking.id, 'Cancelled')}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:text-red-700 hover:border-red-200 cursor-pointer min-h-[38px]"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
