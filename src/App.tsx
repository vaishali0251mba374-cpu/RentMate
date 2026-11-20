import { useCallback, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PRODUCTS } from './data/catalog';
import {
  AppPage,
  CartItem,
  MainCategory,
  Product,
  SubCategory,
  TenureMonths,
} from './types';
import { AuthView } from './components/AuthView';
import { CartDrawer } from './components/CartDrawer';
import { CatalogueView } from './components/CatalogueView';
import { CompareModal } from './components/CompareModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomeView } from './components/HomeView';
import { MyRentalsView } from './components/MyRentalsView';
import { Navbar } from './components/Navbar';
import { ProductDetailView } from './components/ProductDetailView';
import { ProfileView } from './components/ProfileView';

function RentMateAppShell() {
  const { mode, authReady, authNotice, clearAuthNotice, needsProfileCompletion } =
    useAuth();

  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<
    'All' | MainCategory
  >('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<
    'All' | SubCategory
  >('All');

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('rentmate_bag_v1');
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('rentmate_bag_v1', JSON.stringify(cart));
    } catch {
      // ignore storage quota errors
    }
  }, [cart]);

  // If a Google-authenticated user signs in for the first time without a Firestore profile, guide them to complete profile
  useEffect(() => {
    if (needsProfileCompletion && currentPage === 'auth') {
      setCurrentPage('profile');
    }
  }, [needsProfileCompletion, currentPage]);

  const handleNavigate = useCallback((page: AppPage, anchorId?: string) => {
    setCurrentPage(page);
    if (anchorId) {
      window.setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleExploreCatalogue = useCallback(
    (
      category: 'All' | MainCategory = 'All',
      subCategory: 'All' | SubCategory = 'All',
      search = '',
    ) => {
      setSelectedMainCategory(category);
      setSelectedSubCategory(subCategory);
      setSearchQuery(search);
      handleNavigate('catalogue');
    },
    [handleNavigate],
  );

  const handleAddToCart = useCallback(
    (product: Product, tenureMonths: TenureMonths = 6, quantity = 1) => {
      setCart((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: Math.min(5, i.quantity + quantity), tenureMonths }
              : i,
          );
        }
        return [...prev, { product, quantity, tenureMonths }];
      });
    },
    [],
  );

  const handleRentNow = useCallback(
    (product: Product, tenureMonths: TenureMonths = 6, quantity = 1) => {
      handleAddToCart(product, tenureMonths, quantity);
      setIsCartOpen(true);
    },
    [handleAddToCart],
  );

  const handleRentNowFeatured = useCallback(() => {
    if (cart.length > 0) {
      setIsCartOpen(true);
    } else {
      handleExploreCatalogue('All', 'All', '');
    }
  }, [cart.length, handleExploreCatalogue]);

  const handleUpdateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const handleUpdateTenure = useCallback(
    (productId: string, tenureMonths: TenureMonths) => {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, tenureMonths } : item,
        ),
      );
    },
    [],
  );

  const handleRemoveFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const handleToggleCompare = useCallback((product: Product) => {
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      if (prev.length >= 3) return [...prev.slice(1), product];
      return [...prev, product];
    });
  }, []);

  const handleViewProduct = useCallback(
    (product: Product) => {
      setSelectedProduct(product);
      handleNavigate('product');
    },
    [handleNavigate],
  );

  const totalBagCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="font-display text-2xl font-bold text-[#663399]">
            RentMate
          </div>
          <p className="text-sm text-slate-500">Loading Dehradun rental catalogue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFC] text-[#16141F]">
      {/* Clearly labelled Demo Mode or Auth Verification Banner when active */}
      {mode === 'demo' && (
        <div className="bg-[#EDE5F7] border-b border-[#663399]/15 px-4 py-2 text-center text-xs text-[#532680] font-medium">
          Demo Student Mode active (local session storage · no real charges).{' '}
          <button
            type="button"
            onClick={() => handleNavigate('auth')}
            className="underline font-semibold ml-1 cursor-pointer"
          >
            Switch to Firebase Login
          </button>
        </div>
      )}

      {authNotice && (
        <div className="bg-[#DCFCE7] border-b border-[#15803D]/20 px-4 py-2.5 text-center text-xs text-[#15803D] font-medium flex items-center justify-center gap-3">
          <span>{authNotice}</span>
          <button
            type="button"
            onClick={clearAuthNotice}
            className="underline font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        cartCount={totalBagCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomeView
            onExploreCatalogue={handleExploreCatalogue}
            onRentNowFeatured={handleRentNowFeatured}
            compareList={compareList}
            onToggleCompare={handleToggleCompare}
            onViewProduct={handleViewProduct}
            onAddToCart={(p) => handleAddToCart(p, 6, 1)}
          />
        )}

        {currentPage === 'catalogue' && (
          <CatalogueView
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedMainCategory={selectedMainCategory}
            onSelectMainCategory={setSelectedMainCategory}
            selectedSubCategory={selectedSubCategory}
            onSelectSubCategory={setSelectedSubCategory}
            compareList={compareList}
            onToggleCompare={handleToggleCompare}
            onOpenCompareModal={() => setIsCompareOpen(true)}
            onViewProduct={handleViewProduct}
            onAddToCart={(p) => handleAddToCart(p, 6, 1)}
          />
        )}

        {currentPage === 'product' && selectedProduct && (
          <ProductDetailView
            product={selectedProduct}
            onBack={() => handleNavigate('catalogue')}
            onAddToCart={handleAddToCart}
            onRentNow={handleRentNow}
          />
        )}

        {currentPage === 'rentals' && (
          <MyRentalsView
            onExploreCatalogue={() => handleExploreCatalogue('All', 'All', '')}
            onOpenAuth={() => handleNavigate('auth')}
          />
        )}

        {currentPage === 'profile' && (
          <ProfileView
            onNavigateRentals={() => handleNavigate('rentals')}
            onLoggedOut={() => handleNavigate('home')}
          />
        )}

        {currentPage === 'auth' && (
          <AuthView
            onSuccess={() =>
              handleNavigate(needsProfileCompletion ? 'profile' : 'home')
            }
          />
        )}
      </main>

      {/* Clean Startup Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div className="md:col-span-2 space-y-2">
            <div className="font-display text-lg font-bold text-[#663399]">
              RentMate
            </div>
            <p className="text-xs font-medium text-slate-700">
              Rent Smart. Live Better.
            </p>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Student-focused furniture and household essentials rental marketplace serving hostels, PGs, and rented rooms in Dehradun, Uttarakhand.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-900">Categories</div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => handleExploreCatalogue('Furniture', 'All', '')}
                  className="hover:text-[#663399] cursor-pointer"
                >
                  Study Tables & Chairs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleExploreCatalogue('Furniture', 'Beds', '')}
                  className="hover:text-[#663399] cursor-pointer"
                >
                  Beds, Mattresses & Wardrobes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleExploreCatalogue('Home Appliances', 'Coolers', '')}
                  className="hover:text-[#663399] cursor-pointer"
                >
                  Coolers, Fans & Refrigerators
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleExploreCatalogue('Home Appliances', 'Induction Cooktops', '')
                  }
                  className="hover:text-[#663399] cursor-pointer"
                >
                  Washing Machines & Induction
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-900">Student Hub</div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('rentals')}
                  className="hover:text-[#663399] cursor-pointer"
                >
                  My Rentals & Returns
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleNavigate(mode === 'none' ? 'auth' : 'profile')
                  }
                  className="hover:text-[#663399] cursor-pointer"
                >
                  {mode === 'none' ? 'Student Sign In' : 'Profile & Delivery'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('home', 'contact-support')}
                  className="hover:text-[#663399] cursor-pointer"
                >
                  Dehradun Support Desk
                </button>
              </li>
              <li className="text-slate-400">
                Dehradun, Uttarakhand · {PRODUCTS.length} Essentials
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          © 2026 RentMate Dehradun. All rights reserved.
        </div>
      </footer>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateTenure={handleUpdateTenure}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={() => setCart([])}
        onOpenAuth={() => handleNavigate('auth')}
        onOpenRentals={() => handleNavigate('rentals')}
      />

      {isCompareOpen && (
        <CompareModal
          products={compareList}
          onClose={() => setIsCompareOpen(false)}
          onRemove={(id) =>
            setCompareList((prev) => prev.filter((p) => p.id !== id))
          }
          onAddToCart={(p) => handleAddToCart(p, 6, 1)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RentMateAppShell />
      </AuthProvider>
    </ErrorBoundary>
  );
}
