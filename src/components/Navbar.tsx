import { useState } from 'react';
import { Menu, ShoppingBag, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppPage } from '../types';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage, anchorId?: string) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export function Navbar({
  currentPage,
  onNavigate,
  cartCount,
  onOpenCart,
}: NavbarProps) {
  const { mode, profile, firebaseUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isSignedIn = mode !== 'none';
  const displayFirstName =
    profile?.fullName?.split(' ')[0] ||
    firebaseUser?.displayName?.split(' ')[0] ||
    'Account';

  const handleLink = (page: AppPage, anchorId?: string) => {
    setMobileOpen(false);
    onNavigate(page, anchorId);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleLink('home')}
          className="font-display text-xl font-bold tracking-tight text-[#663399] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#663399] rounded-md"
        >
          RentMate
        </button>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => handleLink('home')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              currentPage === 'home'
                ? 'text-[#663399] border-[#663399]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleLink('catalogue')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              currentPage === 'catalogue' || currentPage === 'product'
                ? 'text-[#663399] border-[#663399]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Catalogue
          </button>
          <button
            type="button"
            onClick={() => handleLink('home', 'how-it-works')}
            className="whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:text-slate-900"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => handleLink('rentals')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
              currentPage === 'rentals'
                ? 'text-[#663399] border-[#663399]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            My Rentals
          </button>
          <button
            type="button"
            onClick={() => handleLink('home', 'contact-support')}
            className="whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:text-slate-900"
          >
            Support
          </button>
        </nav>

        {/* Zone 3: Bag + Primary Account Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open rental bag (${cartCount} items)`}
            className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium hover:border-[#663399]/40 hover:bg-[#F7F4FC] transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            <ShoppingBag className="w-4 h-4 text-[#663399]" />
            <span className="hidden sm:inline">Bag</span>
            <span className="tabular-nums font-semibold text-[#663399]">
              {cartCount}
            </span>
          </button>

          {isSignedIn ? (
            <button
              type="button"
              onClick={() => handleLink('profile')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#663399] text-white text-sm font-medium hover:bg-[#532680] transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
            >
              <UserIcon className="w-4 h-4" />
              <span className="max-w-[110px] truncate">{displayFirstName}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleLink('auth')}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#663399] text-white text-sm font-medium hover:bg-[#532680] transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
            >
              Sign In
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          <button
            type="button"
            onClick={() => handleLink('home')}
            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-[#EDE5F7]/60 cursor-pointer"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleLink('catalogue')}
            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-[#EDE5F7]/60 cursor-pointer"
          >
            Catalogue
          </button>
          <button
            type="button"
            onClick={() => handleLink('home', 'how-it-works')}
            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-[#EDE5F7]/60 cursor-pointer"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => handleLink('rentals')}
            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-[#EDE5F7]/60 cursor-pointer"
          >
            My Rentals
          </button>
          <button
            type="button"
            onClick={() => handleLink('home', 'contact-support')}
            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-[#EDE5F7]/60 cursor-pointer"
          >
            Support
          </button>
        </div>
      )}
    </header>
  );
}
