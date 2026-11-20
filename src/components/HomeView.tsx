import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Search,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  APPLIANCE_SUBCATEGORIES,
  DEHRADUN_COLLEGES,
  DEHRADUN_DELIVERY_ZONES,
  FURNITURE_SUBCATEGORIES,
  HERO_IMAGE_URL,
  HOW_IT_WORKS_STEPS,
  PRODUCTS,
  RENTMATE_BENEFITS,
  SAMPLE_TESTIMONIALS,
} from '../data/catalog';
import { MainCategory, Product, SubCategory } from '../types';
import { ProductCard } from './ProductCard';
import { ProductImage } from './ProductImage';

interface HomeViewProps {
  onExploreCatalogue: (
    category?: 'All' | MainCategory,
    subCategory?: 'All' | SubCategory,
    search?: string,
  ) => void;
  onRentNowFeatured: () => void;
  compareList: Product[];
  onToggleCompare: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export function HomeView({
  onExploreCatalogue,
  onRentNowFeatured,
  compareList,
  onToggleCompare,
  onViewProduct,
  onAddToCart,
}: HomeViewProps) {
  const { profile, submitEnquiry } = useAuth();
  const [heroSearch, setHeroSearch] = useState('');

  // Contact / Pilot Enquiry form state
  const [enqName, setEnqName] = useState(profile?.fullName || '');
  const [enqEmail, setEnqEmail] = useState(profile?.email || '');
  const [enqCollege, setEnqCollege] = useState(
    profile?.college || DEHRADUN_COLLEGES[0],
  );
  const [enqTopic, setEnqTopic] = useState('Student Rental Enquiry');
  const [enqMessage, setEnqMessage] = useState('');
  const [enqBusy, setEnqBusy] = useState(false);
  const [enqFeedback, setEnqFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const featuredProducts = PRODUCTS.filter((p) => p.featured).slice(0, 6);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExploreCatalogue('All', 'All', heroSearch);
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnqFeedback(null);
    if (enqName.trim().length < 2 || enqMessage.trim().length < 5) {
      setEnqFeedback({
        ok: false,
        text: 'Please enter your name and a brief message (at least 5 characters).',
      });
      return;
    }

    setEnqBusy(true);
    const res = await submitEnquiry({
      name: enqName,
      email: enqEmail,
      college: enqCollege,
      topic: enqTopic,
      message: enqMessage,
    });
    setEnqBusy(false);

    if (res.ok) {
      setEnqMessage('');
      setEnqFeedback({
        ok: true,
        text: res.savedToCloud
          ? 'Enquiry received and saved to your RentMate account. Our Dehradun campus team will reply shortly.'
          : 'Enquiry recorded! Our Dehradun campus pilot desk will reach out within 24 hours.',
      });
    }
  };

  return (
    <div>
      {/* 1. Storefront Hero Section (2-column stretched split + 5-benefit strip below) */}
      <section className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Copy & Search */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-semibold text-[#663399] mb-3">
                Dehradun, Uttarakhand <span aria-hidden="true">·</span> Rent Smart. Live Better.
              </p>

              <h1
                className="font-display font-bold text-slate-900 tracking-tight leading-[1.08] mb-4"
                style={{
                  fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
                  textWrap: 'balance',
                }}
              >
                Why Buy When You Can Rent?
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mb-7">
                Affordable furniture and household essentials delivered to your doorstep in Dehradun. Built for students in hostels, PGs, and rented rooms.
              </p>

              {/* Search Bar */}
              <form
                onSubmit={handleHeroSearchSubmit}
                className="flex flex-col sm:flex-row gap-2.5 mb-6 max-w-xl"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search study tables, mattresses, coolers, fridges..."
                    aria-label="Search products to rent"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-[#FAFAFC] text-sm focus:outline-none focus:border-[#663399] focus:bg-white min-h-[46px]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-[#EDE5F7] text-[#663399] text-sm font-semibold hover:bg-[#E1D4F3] transition-colors whitespace-nowrap cursor-pointer min-h-[46px]"
                >
                  Search
                </button>
              </form>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => onExploreCatalogue('All', 'All', '')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#663399] text-white text-sm font-semibold hover:bg-[#532680] transition-colors whitespace-nowrap cursor-pointer min-h-[46px]"
                >
                  Explore Products
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onRentNowFeatured}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-[#663399]/35 bg-white text-[#663399] text-sm font-semibold hover:bg-[#F7F4FC] transition-colors whitespace-nowrap cursor-pointer min-h-[46px]"
                >
                  Rent Now
                </button>
              </div>
            </div>

            {/* Right Visual Showcase */}
            <div className="lg:col-span-6">
              <div className="aspect-[16/10] lg:aspect-auto lg:h-full min-h-[300px] rounded-2xl overflow-hidden bg-[#EDE5F7] border border-slate-200/80">
                <ProductImage
                  src={HERO_IMAGE_URL}
                  alt="Sunlit student room in Dehradun furnished with RentMate desk, bed, and mini fridge"
                  focus="center"
                />
              </div>
            </div>
          </div>

          {/* 5 Core Benefits Strip (Full-Width below hero split) */}
          <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {RENTMATE_BENEFITS.map((benefit) => (
              <div key={benefit.number} className="space-y-1.5">
                <div className="text-xs font-semibold text-[#663399] tabular-nums">
                  {benefit.number}. {benefit.title}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Product Categories & Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-[#663399] mb-1.5">
              Curated Student Catalogue
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Browse Categories & Featured Rentals
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onExploreCatalogue('All', 'All', '')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#663399] hover:text-[#532680] whitespace-nowrap cursor-pointer self-start md:self-auto"
          >
            View all {PRODUCTS.length} essentials
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Directory Grid (Furniture & Home Appliances) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Furniture
              </h3>
              <button
                type="button"
                onClick={() => onExploreCatalogue('Furniture', 'All', '')}
                className="text-xs font-semibold text-[#663399] hover:underline cursor-pointer"
              >
                Explore Furniture
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {FURNITURE_SUBCATEGORIES.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => onExploreCatalogue('Furniture', sub, '')}
                  className="px-3.5 py-2 rounded-xl bg-[#F7F4FC] hover:bg-[#EDE5F7] text-xs font-medium text-slate-800 hover:text-[#663399] transition-colors cursor-pointer"
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Home Appliances
              </h3>
              <button
                type="button"
                onClick={() => onExploreCatalogue('Home Appliances', 'All', '')}
                className="text-xs font-semibold text-[#663399] hover:underline cursor-pointer"
              >
                Explore Appliances
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {APPLIANCE_SUBCATEGORIES.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => onExploreCatalogue('Home Appliances', sub, '')}
                  className="px-3.5 py-2 rounded-xl bg-[#F7F4FC] hover:bg-[#EDE5F7] text-xs font-medium text-slate-800 hover:text-[#663399] transition-colors cursor-pointer"
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3-Column Featured Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isCompared={compareList.some((c) => c.id === product.id)}
              onToggleCompare={onToggleCompare}
              onViewProduct={onViewProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>

      {/* 3. How RentMate Works & Why Choose RentMate */}
      <section
        id="how-it-works"
        className="bg-white border-y border-slate-200/80 py-14 sm:py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div>
            <div className="max-w-2xl mb-10">
              <div className="text-xs font-semibold text-[#663399] mb-1.5">
                How RentMate Works
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                From online selection to doorstep setup in 48 hours
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                No security deposit surprises, no second-hand bargain hunting, and no moving-day transport headaches.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOW_IT_WORKS_STEPS.map((item) => (
                <div
                  key={item.step}
                  className="p-6 rounded-2xl bg-[#FAFAFC] border border-slate-200/80"
                >
                  <div className="font-display text-2xl font-bold text-[#663399] tabular-nums mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-display text-base font-semibold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose RentMate Comparison Strip */}
          <div className="rounded-2xl bg-[#EDE5F7]/55 border border-[#663399]/15 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-3">
              <div className="text-xs font-semibold text-[#663399]">
                Why Choose RentMate
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Save up to 70% of upfront move-in costs
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                Buying a study desk, chair, mattress, and room cooler in Dehradun can cost ₹25,000+ upfront. RentMate gives you verified, sanitized essentials for a fraction of the price—only for the months you stay.
              </p>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {RENTMATE_BENEFITS.map((b) => (
                <div
                  key={b.number}
                  className="bg-white rounded-xl p-4 border border-slate-200/70"
                >
                  <div className="text-sm font-semibold text-slate-900 mb-1">
                    {b.title}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Student Testimonials (Clearly Marked Sample/Demo Content) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-[#663399] mb-1.5">
              Sample Student Stories (Demo Content)
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Designed around real Dehradun student moves
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Illustrative pilot scenarios across DGU, Graphic Era & Rajpur Road
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_TESTIMONIALS.map((t) => (
            <article
              key={t.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="text-xs text-slate-500">
                  Sample Student Review <span aria-hidden="true">·</span> {t.accommodation}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  “{t.before} {t.outcome}”
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="font-display text-sm font-semibold text-slate-900">
                  {t.name}
                </div>
                <div className="text-xs text-slate-500">{t.role}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. Contact & Campus Pilot Enquiry Section */}
      <section
        id="contact-support"
        className="bg-white border-t border-slate-200/80 py-14 sm:py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="text-xs font-semibold text-[#663399] mb-1.5">
                Dehradun Campus Desk
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                Questions about delivery, bulk PG setups, or custom tenures?
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Reach our Dehradun student operations desk for hostel group orders, summer cooler bookings, or supplier partnerships.
              </p>
            </div>

            <div className="bg-[#F7F4FC] rounded-2xl p-5 border border-[#663399]/15 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <MapPin className="w-4 h-4 text-[#663399]" />
                Active Dehradun Service Zones
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {DEHRADUN_DELIVERY_ZONES.map((zone) => (
                  <li key={zone}>{zone}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleEnquirySubmit}
              className="bg-[#FAFAFC] border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-4"
            >
              <h3 className="font-display text-lg font-bold text-slate-900">
                Send a Rental or Campus Enquiry
              </h3>

              {enqFeedback && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                    enqFeedback.ok
                      ? 'bg-[#DCFCE7] border-[#15803D]/25 text-[#15803D]'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {enqFeedback.ok && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  <span>{enqFeedback.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={enqName}
                    onChange={(e) => setEnqName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#663399]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={enqEmail}
                    onChange={(e) => setEnqEmail(e.target.value)}
                    placeholder="student@university.ac.in"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#663399]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    College / University
                  </label>
                  <select
                    value={enqCollege}
                    onChange={(e) => setEnqCollege(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#663399]"
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
                    Enquiry Topic
                  </label>
                  <select
                    value={enqTopic}
                    onChange={(e) => setEnqTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#663399]"
                  >
                    <option value="Student Rental Enquiry">Student Rental Enquiry</option>
                    <option value="PG / Hostel Group Package">PG / Hostel Group Package</option>
                    <option value="Local Supplier Partnership">Local Supplier Partnership</option>
                    <option value="Delivery & Return Support">Delivery & Return Support</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={3}
                  required
                  value={enqMessage}
                  onChange={(e) => setEnqMessage(e.target.value)}
                  placeholder="Tell us which items you need, your PG/hostel area, and preferred rental period..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#663399]"
                />
              </div>

              <button
                type="submit"
                disabled={enqBusy}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#663399] text-white text-sm font-semibold hover:bg-[#532680] disabled:opacity-60 transition-colors cursor-pointer min-h-[44px]"
              >
                <Send className="w-4 h-4" />
                {enqBusy ? 'Sending...' : 'Submit Enquiry'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
