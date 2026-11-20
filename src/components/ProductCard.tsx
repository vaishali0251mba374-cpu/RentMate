import { useState } from 'react';
import { Check, GitCompare, Plus } from 'lucide-react';
import { Product } from '../types';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  isCompared: boolean;
  onToggleCompare: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({
  product,
  isCompared,
  onToggleCompare,
  onViewProduct,
  onAddToCart,
}: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article className="group bg-white border border-slate-200/90 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Media frame (clean neutral surface, 4:3 consistent aspect) */}
      <div
        onClick={() => onViewProduct(product)}
        className="relative aspect-[4/3] bg-[#F4F2F8] overflow-hidden cursor-pointer"
      >
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          focus={product.imageFocus}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      {/* Card Body — identical field order across all cards */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Clean unboxed metadata (Zero-Pill Discipline) */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1.5">
          <span className="truncate">
            {product.category} <span aria-hidden="true">·</span> {product.subCategory}
          </span>
          <span className="shrink-0 text-emerald-700 font-medium">
            {product.inStock ? 'In Stock' : 'Waitlist'}
          </span>
        </div>

        <h3
          onClick={() => onViewProduct(product)}
          className="font-display text-base font-semibold text-slate-900 leading-snug mb-1.5 cursor-pointer group-hover:text-[#663399] transition-colors line-clamp-2"
        >
          {product.name}
        </h3>

        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4">
          {product.shortDescription}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-baseline justify-between gap-2 mb-3.5">
            <div>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                ₹{product.monthlyRent}
              </span>
              <span className="text-xs text-slate-500">/mo</span>
            </div>
            <span className="text-xs text-slate-500 tabular-nums">
              Deposit ₹{product.securityDeposit}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAdd}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap cursor-pointer min-h-[40px] ${
                justAdded
                  ? 'bg-[#DCFCE7] text-[#15803D] border border-[#15803D]/25'
                  : 'bg-[#663399] text-white hover:bg-[#532680]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  Added to Bag
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add to Bag
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onToggleCompare(product)}
              aria-pressed={isCompared}
              title={isCompared ? 'Remove from comparison' : 'Compare product'}
              className={`inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] ${
                isCompared
                  ? 'bg-[#EDE5F7] text-[#663399] border-[#663399]/35'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>{isCompared ? 'Comparing' : 'Compare'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
