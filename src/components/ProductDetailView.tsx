import { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { TENURE_OPTIONS, getDiscountedMonthlyRent } from '../data/catalog';
import { Product, TenureMonths } from '../types';
import { ProductImage } from './ProductImage';

interface ProductDetailViewProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, tenure: TenureMonths, quantity: number) => void;
  onRentNow: (product: Product, tenure: TenureMonths, quantity: number) => void;
}

export function ProductDetailView({
  product,
  onBack,
  onAddToCart,
  onRentNow,
}: ProductDetailViewProps) {
  const [tenure, setTenure] = useState<TenureMonths>(6);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const effectiveMonthly = getDiscountedMonthlyRent(product.monthlyRent, tenure);
  const totalTenureRent = effectiveMonthly * tenure * quantity;
  const retailCost = product.retailPrice * quantity;
  const estimatedSavings = Math.max(0, retailCost - totalTenureRent);

  const handleAdd = () => {
    onAddToCart(product, tenure, quantity);
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1500);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#663399] mb-6 cursor-pointer min-h-[40px]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalogue
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Sticky Media & Highlights */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-6">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#F4F2F8] border border-slate-200/80">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              focus={product.imageFocus}
            />
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Specifications & Fit
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500 text-xs mb-0.5">Dimensions</dt>
                <dd className="font-medium text-slate-900 tabular-nums">
                  {product.dimensions}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 text-xs mb-0.5">Material / Spec</dt>
                <dd className="font-medium text-slate-900">
                  {product.materialOrSpec}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 text-xs mb-0.5">Ideal For</dt>
                <dd className="font-medium text-slate-900">
                  {product.bestFor.join(' · ')}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 text-xs mb-0.5">Verified Local Supplier</dt>
                <dd className="font-medium text-slate-900">{product.supplierName}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <div className="text-xs text-slate-500 mb-2">
              {product.category} <span aria-hidden="true">·</span> {product.subCategory}{' '}
              <span aria-hidden="true">·</span>{' '}
              <span className="text-emerald-700 font-medium">Available in Dehradun</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
              {product.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {product.fullDescription}
            </p>
          </div>

          {/* Pricing Summary */}
          <div className="bg-[#F7F4FC] rounded-xl p-5 flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <div className="text-xs text-slate-600 mb-0.5">Monthly Rental Rate</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-[#663399] tabular-nums">
                  ₹{effectiveMonthly}
                </span>
                <span className="text-sm text-slate-600">/month</span>
                {effectiveMonthly < product.monthlyRent && (
                  <span className="text-sm text-slate-400 line-through tabular-nums ml-1">
                    ₹{product.monthlyRent}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-600 mb-0.5">Refundable Deposit</div>
              <div className="text-base font-semibold text-slate-900 tabular-nums">
                ₹{product.securityDeposit * quantity}
              </div>
            </div>
          </div>

          {/* Flexible Tenure Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2.5">
              Select Flexible Rental Period
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {TENURE_OPTIONS.map((opt) => {
                const active = tenure === opt.months;
                return (
                  <button
                    key={opt.months}
                    type="button"
                    onClick={() => setTenure(opt.months)}
                    className={`px-3.5 py-2.5 rounded-xl border text-left transition-colors cursor-pointer min-h-[44px] ${
                      active
                        ? 'bg-[#EDE5F7] border-[#663399] text-[#663399]'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm font-semibold whitespace-nowrap">
                      {opt.months} {opt.months === 1 ? 'Month' : 'Months'}
                    </div>
                    <div className="text-xs opacity-80">
                      {opt.discountPercent > 0
                        ? `Save ${opt.discountPercent}% · ₹${getDiscountedMonthlyRent(
                            product.monthlyRent,
                            opt.months,
                          )}/mo`
                        : `Standard ₹${product.monthlyRent}/mo`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity & Buy vs Rent comparison */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">Quantity</span>
              <div className="inline-flex items-center border border-slate-200 rounded-xl bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500">
                Buying new costs ~₹{retailCost.toLocaleString('en-IN')}
              </div>
              <div className="text-sm font-semibold text-emerald-700 tabular-nums">
                Save ₹{estimatedSavings.toLocaleString('en-IN')} over {tenure} mo
              </div>
            </div>
          </div>

          {/* Highlights */}
          <ul className="space-y-2">
            {product.highlights.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                <Check className="w-4 h-4 text-[#663399] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleAdd}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold border transition-colors cursor-pointer min-h-[44px] ${
                addedFeedback
                  ? 'bg-[#DCFCE7] text-[#15803D] border-[#15803D]/30'
                  : 'bg-white text-[#663399] border-[#663399] hover:bg-[#F7F4FC]'
              }`}
            >
              {addedFeedback ? 'Added to Rental Bag' : 'Add to Rental Bag'}
            </button>
            <button
              type="button"
              onClick={() => onRentNow(product, tenure, quantity)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#663399] text-white text-sm font-semibold hover:bg-[#532680] transition-colors cursor-pointer min-h-[44px]"
            >
              Rent Now
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#663399] shrink-0" />
              <span>{product.deliveryEstimate}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#663399] shrink-0" />
              <span>100% refundable deposit on return</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
