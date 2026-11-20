import { X } from 'lucide-react';
import { getDiscountedMonthlyRent } from '../data/catalog';
import { Product } from '../types';
import { ProductImage } from './ProductImage';

interface CompareModalProps {
  products: Product[];
  onClose: () => void;
  onRemove: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export function CompareModal({
  products,
  onClose,
  onRemove,
  onAddToCart,
}: CompareModalProps) {
  if (products.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Compare Rental Products"
    >
      <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[88vh] overflow-hidden flex flex-col shadow-xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Compare Rental Products
            </h2>
            <p className="text-xs text-slate-500">
              Side-by-side breakdown of monthly rates, deposits, and buy-vs-rent savings
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison modal"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-auto p-6">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr>
                <th className="py-3 pr-4 text-xs font-semibold text-slate-500 align-top w-40">
                  Specification
                </th>
                {products.map((p) => (
                  <th key={p.id} className="py-3 px-3 align-top">
                    <div className="space-y-2.5">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#F4F2F8]">
                        <ProductImage src={p.imageUrl} alt={p.name} focus={p.imageFocus} />
                      </div>
                      <div className="font-display text-sm font-semibold text-slate-900">
                        {p.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(p.id)}
                        className="text-xs text-slate-500 hover:text-red-600 font-normal cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr>
                <td className="py-3 pr-4 text-slate-500">Category</td>
                {products.map((p) => (
                  <td key={p.id} className="py-3 px-3 text-slate-800">
                    {p.category} · {p.subCategory}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-slate-500">1-Month Rent</td>
                {products.map((p) => (
                  <td key={p.id} className="py-3 px-3 font-semibold text-slate-900 tabular-nums">
                    ₹{p.monthlyRent}/mo
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-slate-500">6-Month Plan (-10%)</td>
                {products.map((p) => (
                  <td key={p.id} className="py-3 px-3 font-semibold text-[#663399] tabular-nums">
                    ₹{getDiscountedMonthlyRent(p.monthlyRent, 6)}/mo
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-slate-500">Refundable Deposit</td>
                {products.map((p) => (
                  <td key={p.id} className="py-3 px-3 text-slate-800 tabular-nums">
                    ₹{p.securityDeposit}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-slate-500">Retail Purchase Price</td>
                {products.map((p) => (
                  <td key={p.id} className="py-3 px-3 text-slate-500 tabular-nums">
                    ~₹{p.retailPrice.toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-slate-500">6-Month Savings</td>
                {products.map((p) => {
                  const sixMoTotal = getDiscountedMonthlyRent(p.monthlyRent, 6) * 6;
                  const saved = Math.max(0, p.retailPrice - sixMoTotal);
                  return (
                    <td key={p.id} className="py-3 px-3 font-semibold text-emerald-700 tabular-nums">
                      Save ₹{saved.toLocaleString('en-IN')}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-slate-500">Dimensions</td>
                {products.map((p) => (
                  <td key={p.id} className="py-3 px-3 text-slate-700 tabular-nums">
                    {p.dimensions}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-slate-500">Best Room Fit</td>
                {products.map((p) => (
                  <td key={p.id} className="py-3 px-3 text-slate-700">
                    {p.bestFor.join(', ')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 pr-4" />
                {products.map((p) => (
                  <td key={p.id} className="py-4 px-3">
                    <button
                      type="button"
                      onClick={() => onAddToCart(p)}
                      className="w-full px-4 py-2 rounded-xl bg-[#663399] text-white text-xs font-semibold hover:bg-[#532680] transition-colors cursor-pointer min-h-[40px]"
                    >
                      Add to Bag
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
