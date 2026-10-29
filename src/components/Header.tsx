'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FishBasketLogo from './FishBasketLogo';
import ThemeToggle from './ThemeToggle';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useLocation } from '@/context/LocationContext';
import {
  MapPin,
  Search,
  ShoppingCart,
  Heart,
  User,
  ChevronDown,
  Menu,
  X,
  Shield,
  Truck,
  Sparkles,
  LogOut,
  Package,
  Anchor,
} from 'lucide-react';
import { formatINR } from '@/lib/cartUtils';

export default function Header() {
  const router = useRouter();
  const { itemsCount, summary, toggleCart } = useCart();
  const { user, role, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { selectedPincode, selectedZone, openLocationModal } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navCategories = [
    { name: 'Freshwater Fish', href: '/category/freshwater-fish' },
    { name: 'Sea Fish', href: '/category/sea-fish' },
    { name: 'Prawns', href: '/category/prawns' },
    { name: 'Crabs', href: '/category/crabs' },
    { name: 'Lobster', href: '/category/lobster' },
    { name: 'Squid & Calamari', href: '/category/squid-cuttlefish' },
    { name: 'Combos', href: '/category/seafood-combos' },
    { name: 'Special Offers', href: '/offers', highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#17232E] border-b border-[#DCE5EA] dark:border-[#243444] shadow-xs transition-colors duration-200">
      {/* Main Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1F2E3D] text-[#112233] dark:text-[#EAF2F8] transition-colors"
            aria-label="Open navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <FishBasketLogo />
        </div>

        {/* Location Selector */}
        <button
          onClick={openLocationModal}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00D2C4]/10 dark:bg-[#00D2C4]/15 hover:bg-[#00D2C4]/20 border border-[#00D2C4]/30 text-left transition-all duration-200 group max-w-[210px] cursor-pointer"
        >
          <MapPin className="w-4 h-4 text-[#00D2C4] flex-shrink-0 group-hover:scale-110 transition-transform" />
          <div className="overflow-hidden">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#009E93] dark:text-[#00D2C4] flex items-center gap-1">
              Deliver To <ChevronDown className="w-3 h-3 text-[#00D2C4]" />
            </div>
            <div className="text-xs font-semibold text-[#112233] dark:text-[#EAF2F8] truncate">
              {selectedZone ? selectedZone.area_name : `PIN: ${selectedPincode}`}
            </div>
          </div>
        </button>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-xl relative hidden sm:block"
        >
          <input
            type="text"
            placeholder="Search fresh Pomfret, Tiger Prawns, Surmai, Rohu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-24 py-2 text-sm bg-[#EDF3F5] dark:bg-[#0F1820] hover:bg-[#E5ECEF] dark:hover:bg-[#14202B] focus:bg-white dark:focus:bg-[#17232E] rounded-full border border-[#DCE5EA] dark:border-[#243444] focus:border-[#00D2C4] focus:outline-none focus:ring-2 focus:ring-[#00D2C4]/20 transition-all text-[#112233] dark:text-[#EAF2F8] placeholder:text-[#7E92A2] dark:placeholder:text-[#6B7F91]"
          />
          <Search className="w-4 h-4 text-[#7E92A2] dark:text-[#6B7F91] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 btn-aqua rounded-full text-xs font-bold shadow-xs cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Right Action Icons: Staff Portal, Theme Toggle, Wishlist, Account, Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Authenticated Staff/Partner Portal Link */}
          {user && role === 'admin' && (
            <Link
              href="/admin"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00D2C4]/15 border border-[#00D2C4]/35 text-[#009E93] dark:text-[#00D2C4] text-xs font-bold hover:bg-[#00D2C4]/25 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-[#00D2C4]" />
              <span>Admin Portal</span>
            </Link>
          )}
          {user && role === 'fisherman' && (
            <Link
              href="/fisherman"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-colors"
            >
              <Anchor className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Fisherman Portal</span>
            </Link>
          )}
          {user && role === 'delivery_partner' && (
            <Link
              href="/delivery"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/25 transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Delivery Fleet</span>
            </Link>
          )}

          {/* Theme Switcher Toggle */}
          <ThemeToggle />

          {/* Wishlist */}
          <Link
            href="/account/wishlist"
            className="p-2 text-[#52667A] dark:text-[#9DB0C0] hover:text-rose-500 dark:hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors relative"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 rounded-xl text-[#112233] dark:text-[#EAF2F8] hover:bg-[#EDF3F5] dark:hover:bg-[#1F2E3D] transition-colors cursor-pointer"
              aria-label="Account Menu"
            >
              <div className="w-7 h-7 rounded-full bg-[#00D2C4]/20 text-[#009E93] dark:text-[#00D2C4] flex items-center justify-center font-bold text-xs border border-[#00D2C4]/30">
                {user ? user.full_name.charAt(0) : <User className="w-4 h-4" />}
              </div>
              <span className="hidden md:inline text-xs font-semibold max-w-[85px] truncate">
                {user ? user.full_name.split(' ')[0] : 'Sign In'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#7E92A2] dark:text-[#6B7F91] hidden md:inline" />
            </button>

            {isAccountMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#17232E] rounded-2xl shadow-xl border border-[#DCE5EA] dark:border-[#243444] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setIsAccountMenuOpen(false)}
              >
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-[#DCE5EA] dark:border-[#243444]">
                      <div className="font-bold text-sm text-[#112233] dark:text-[#EAF2F8]">{user.full_name}</div>
                      <div className="text-xs text-[#52667A] dark:text-[#9DB0C0] truncate">{user.email}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-[#00D2C4]/15 text-[#009E93] dark:text-[#00D2C4] font-semibold text-[10px] rounded-full uppercase border border-[#00D2C4]/30">
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>

                    <Link
                      href="/account"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#112233] dark:text-[#EAF2F8] hover:bg-[#F4F7F6] dark:hover:bg-[#1F2E3D] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#7E92A2] dark:text-[#6B7F91]" /> Account Overview
                    </Link>
                    <Link
                      href="/account/orders"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#112233] dark:text-[#EAF2F8] hover:bg-[#F4F7F6] dark:hover:bg-[#1F2E3D] transition-colors"
                    >
                      <Package className="w-4 h-4 text-[#7E92A2] dark:text-[#6B7F91]" /> My Orders
                    </Link>
                    <Link
                      href="/account/addresses"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#112233] dark:text-[#EAF2F8] hover:bg-[#F4F7F6] dark:hover:bg-[#1F2E3D] transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-[#7E92A2] dark:text-[#6B7F91]" /> Saved Addresses
                    </Link>

                    {role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#009E93] dark:text-[#00D2C4] hover:bg-[#00D2C4]/10 border-t border-[#DCE5EA] dark:border-[#243444] transition-colors"
                      >
                        <Shield className="w-4 h-4 text-[#00D2C4]" /> Admin Dashboard
                      </Link>
                    )}

                    {role === 'fisherman' && (
                      <Link
                        href="/fisherman"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border-t border-[#DCE5EA] dark:border-[#243444] transition-colors"
                      >
                        <Anchor className="w-4 h-4 text-emerald-500" /> Fisherman Dashboard
                      </Link>
                    )}

                    {role === 'delivery_partner' && (
                      <Link
                        href="/delivery"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border-t border-[#DCE5EA] dark:border-[#243444] transition-colors"
                      >
                        <Truck className="w-4 h-4 text-amber-500" /> Delivery Dashboard
                      </Link>
                    )}

                    <div className="border-t border-[#DCE5EA] dark:border-[#243444] mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-2">
                    <Link
                      href="/login"
                      className="block w-full py-2 btn-aqua rounded-xl text-xs font-bold text-center transition-all"
                    >
                      Login / Register
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Button: Bright Aqua #00D2C4 Action */}
          <button
            onClick={toggleCart}
            className="flex items-center gap-2 btn-aqua px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all group"
            aria-label="Shopping Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4 text-[#112233] group-hover:scale-110 transition-transform" />
              {itemsCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-[#FF6B4A] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#112233] shadow-xs">
                  {itemsCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-black tracking-tight text-[#112233]">
              {summary.totalAmount > 0 ? formatINR(summary.totalAmount) : 'Cart'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="px-4 pb-2.5 sm:hidden">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search fresh fish, prawns, crabs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-20 py-2 text-xs bg-[#EDF3F5] dark:bg-[#0F1820] rounded-full border border-[#DCE5EA] dark:border-[#243444] focus:outline-none focus:border-[#00D2C4] text-[#112233] dark:text-[#EAF2F8] placeholder:text-[#7E92A2] dark:placeholder:text-[#6B7F91]"
          />
          <Search className="w-3.5 h-3.5 text-[#7E92A2] dark:text-[#6B7F91] absolute left-3 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 btn-aqua rounded-full text-[11px] font-bold"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Pills Navigation (Secondary Bar) */}
      <nav className="bg-[#F8FAFA] dark:bg-[#121C25] border-t border-[#E8EEF2] dark:border-[#1E2D3B] hidden lg:block overflow-x-auto transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 py-1.5">
          <Link
            href="/shop"
            className="px-3 py-1 text-xs font-bold text-[#112233] dark:text-[#EAF2F8] hover:text-[#00D2C4] dark:hover:text-[#00D2C4] hover:bg-white dark:hover:bg-[#17232E] rounded-lg transition-all"
          >
            All Seafood
          </Link>
          {navCategories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
                cat.highlight
                  ? 'text-[#009E93] dark:text-[#00D2C4] bg-[#00D2C4]/10 dark:bg-[#00D2C4]/15 font-bold hover:bg-[#00D2C4]/20'
                  : 'text-[#52667A] dark:text-[#9DB0C0] hover:text-[#112233] dark:hover:text-[#EAF2F8] hover:bg-white dark:hover:bg-[#17232E]'
              }`}
            >
              {cat.highlight && <Sparkles className="w-3 h-3 text-[#00D2C4]" />}
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#DCE5EA] dark:border-[#243444] bg-white dark:bg-[#17232E] p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => {
                openLocationModal();
                setIsMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-between p-2.5 rounded-xl bg-[#00D2C4]/10 dark:bg-[#00D2C4]/15 text-[#112233] dark:text-[#EAF2F8] font-semibold text-xs border border-[#00D2C4]/30"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00D2C4]" />
                <span className="truncate">Deliver to: {selectedZone ? selectedZone.area_name : selectedPincode}</span>
              </div>
              <span className="text-[11px] underline text-[#00D2C4] font-bold ml-1">Change</span>
            </button>
            <ThemeToggle showLabel size="sm" />
          </div>

          <div className="text-xs font-bold text-[#7E92A2] dark:text-[#6B7F91] uppercase tracking-wider pt-1">
            Seafood Categories
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-[#EDF3F5] dark:bg-[#121C25] hover:bg-[#00D2C4]/10 text-xs font-bold text-[#112233] dark:text-[#EAF2F8]"
            >
              All Seafood
            </Link>
            {navCategories.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-2.5 rounded-xl text-xs font-medium transition-colors ${
                  c.highlight
                    ? 'bg-[#00D2C4]/15 text-[#009E93] dark:text-[#00D2C4] font-bold border border-[#00D2C4]/30'
                    : 'bg-[#EDF3F5] dark:bg-[#121C25] hover:bg-[#00D2C4]/10 text-[#52667A] dark:text-[#9DB0C0]'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-[#DCE5EA] dark:border-[#243444] pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#112233] dark:text-[#EAF2F8] px-1">
                  <span>Logged in as: <strong className="text-[#00D2C4]">{user.full_name.split(' ')[0]}</strong></span>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-[#EDF3F5] dark:bg-[#1F2E3D] font-bold text-[#52667A] dark:text-[#9DB0C0]">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                {role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-[#00D2C4]/15 text-[#009E93] dark:text-[#00D2C4] font-bold text-xs"
                  >
                    <Shield className="w-4 h-4 text-[#00D2C4]" /> Admin Dashboard
                  </Link>
                )}
                {role === 'fisherman' && (
                  <Link
                    href="/fisherman"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs"
                  >
                    <Anchor className="w-4 h-4 text-emerald-500" /> Fisherman Dashboard
                  </Link>
                )}
                {role === 'delivery_partner' && (
                  <Link
                    href="/delivery"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-xs"
                  >
                    <Truck className="w-4 h-4 text-amber-500" /> Delivery Fleet Hub
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 text-xs text-rose-600 dark:text-rose-400 font-semibold cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 btn-aqua rounded-xl text-xs font-bold"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-[#EDF3F5] dark:bg-[#1F2E3D] text-[#112233] dark:text-[#EAF2F8] rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
