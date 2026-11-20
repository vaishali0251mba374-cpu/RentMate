import { useMemo, useState } from 'react';
import { GitCompare, Search, SlidersHorizontal, X } from 'lucide-react';
import {
  APPLIANCE_SUBCATEGORIES,
  FURNITURE_SUBCATEGORIES,
  PRODUCTS,
} from '../data/catalog';
import {
  AccommodationType,
  MainCategory,
  Product,
  SubCategory,
} from '../types';
import { ProductCard } from './ProductCard';

interface CatalogueViewProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedMainCategory: 'All' | MainCategory;
  onSelectMainCategory: (cat: 'All' | MainCategory) => void;
  selectedSubCategory: 'All' | SubCategory;
  onSelectSubCategory: (sub: 'All' | SubCategory) => void;
  compareList: Product[];
  onToggleCompare: (product: Product) => void;
  onOpenCompareModal: () => void;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export function CatalogueView({
  searchQuery,
  onSearchChange,
  selectedMainCategory,
  onSelectMainCategory,
  selectedSubCategory,
  onSelectSubCategory,
  compareList,
  onToggleCompare,
  onOpenCompareModal,
  onViewProduct,
  onAddToCart,
}: CatalogueViewProps) {
  const [accommodationFilter, setAccommodationFilter] = useState<
    'All' | AccommodationType
  >('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>(
    'featured',
  );

  const visibleSubcategories = useMemo(() => {
    if (selectedMainCategory === 'Furniture') return FURNITURE_SUBCATEGORIES;
    if (selectedMainCategory === 'Home Appliances') return APPLIANCE_SUBCATEGORIES;
    return [...FURNITURE_SUBCATEGORIES, ...APPLIANCE_SUBCATEGORIES];
  }, [selectedMainCategory]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = PRODUCTS.filter((p) => {
      if (selectedMainCategory !== 'All' && p.category !== selectedMainCategory) {
        return false;
      }
      if (selectedSubCategory !== 'All' && p.subCategory !== selectedSubCategory) {
        return false;
      }
      if (
        accommodationFilter !== 'All' &&
        !p.bestFor.includes(accommodationFilter)
      ) {
        return false;
      }
      if (q) {
        const hay = `${p.name} ${p.category} ${p.subCategory} ${p.shortDescription}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.monthlyRent - b.monthlyRent);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.monthlyRent - a.monthlyRent);
    }
    return list;
  }, [
    searchQuery,
    selectedMainCategory,
    selectedSubCategory,
    accommodationFilter,
    sortBy,
  ]);

  const resetFilters = () => {
    onSearchChange('');
    onSelectMainCategory('All');
    onSelectSubCategory('All');
    setAccommodationFilter('All');
    setSortBy('featured');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      {/* Page Title & Search */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <div className="text-xs text-slate-500 mb-1.5">
            Dehradun Catalogue <span aria-hidden="true">·</span> 11 Essential Categories
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Student Furniture & Appliances on Rent
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search study table, cooler, bed..."
              aria-label="Search rental catalogue"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#663399] min-h-[42px]"
            />
          </div>

          <select
            aria-label="Sort products"
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')
            }
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:border-[#663399] min-h-[42px]"
          >
            <option value="featured">Sort: Recommended</option>
            <option value="price-asc">Rent: Low to High</option>
            <option value="price-desc">Rent: High to Low</option>
          </select>
        </div>
      </div>

      {/* Interactive Main Category Tabs + Room Fit Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200 mb-5">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          {(['All', 'Furniture', 'Home Appliances'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onSelectMainCategory(cat);
                onSelectSubCategory('All');
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedMainCategory === cat
                  ? 'bg-white text-[#663399] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-600 font-medium">Room fit:</span>
          {(['All', 'Hostel', 'PG', 'Rented Room'] as const).map((fit) => (
            <button
              key={fit}
              type="button"
              onClick={() => setAccommodationFilter(fit)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                accommodationFilter === fit
                  ? 'bg-[#EDE5F7] text-[#663399]'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {fit}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory Interactive Filter Row */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <button
          type="button"
          onClick={() => onSelectSubCategory('All')}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
            selectedSubCategory === 'All'
              ? 'bg-[#663399] text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:border-[#663399]/40'
          }`}
        >
          All {selectedMainCategory === 'All' ? 'Items' : selectedMainCategory}
        </button>
        {visibleSubcategories.map((sub) => (
          <button
            key={sub}
            type="button"
            onClick={() => onSelectSubCategory(sub)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              selectedSubCategory === sub
                ? 'bg-[#663399] text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-[#663399]/40'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Compare Bar (when >= 1 item selected) */}
      {compareList.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-[#EDE5F7]/75 border border-[#663399]/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-800">
            <GitCompare className="w-4 h-4 text-[#663399]" />
            <span className="font-semibold">
              {compareList.length} {compareList.length === 1 ? 'item' : 'items'} selected to compare:
            </span>
            <span className="text-slate-600">
              {compareList.map((p) => p.name).join(' · ')}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenCompareModal}
              className="px-4 py-2 rounded-xl bg-[#663399] text-white text-xs font-semibold hover:bg-[#532680] cursor-pointer min-h-[36px]"
            >
              Compare Side by Side
            </button>
            <button
              type="button"
              onClick={() => compareList.forEach((p) => onToggleCompare(p))}
              aria-label="Clear comparison selection"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Product Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <h2 className="font-display text-lg font-semibold text-slate-900 mb-2">
            No matching rental products found
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Try clearing your search query or switching room fit filters to see all available Dehradun furniture and appliances.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-[#663399] text-white text-sm font-semibold hover:bg-[#532680] cursor-pointer min-h-[42px]"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
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
      )}
    </section>
  );
}
