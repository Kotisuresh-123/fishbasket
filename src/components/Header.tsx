'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FishBasketLogo from './FishBasketLogo';
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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm">
      {/* Main Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
            aria-label="Open navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <FishBasketLogo />
        </div>

        {/* Location Selector */}
        <button
          onClick={openLocationModal}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50/70 hover:bg-teal-100/70 border border-teal-200/60 text-left transition-colors group max-w-[210px]"
        >
          <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <div className="overflow-hidden">
            <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
              Deliver To <ChevronDown className="w-3 h-3 text-teal-600" />
            </div>
            <div className="text-xs font-semibold text-slate-800 truncate">
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
            className="w-full pl-10 pr-24 py-2 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white rounded-full border border-slate-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-slate-800 placeholder:text-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-xs font-semibold transition-colors"
          >
            Search
          </button>
        </form>

        {/* Right Action Icons: Demo Role Switcher, Wishlist, Account, Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Authenticated Staff/Partner Portal Link (strictly role-gated, no unauthenticated switching) */}
          {user && role === 'admin' && (
            <Link
              href="/admin"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-teal-700" />
              <span>Admin Portal</span>
            </Link>
          )}
          {user && role === 'fisherman' && (
            <Link
              href="/fisherman"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <Anchor className="w-3.5 h-3.5 text-emerald-700" />
              <span>Fisherman Portal</span>
            </Link>
          )}
          {user && role === 'delivery_partner' && (
            <Link
              href="/delivery"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-amber-700" />
              <span>Delivery Fleet</span>
            </Link>
          )}

          {/* Wishlist */}
          <Link
            href="/account/wishlist"
            className="p-2 text-slate-600 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors relative"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Account Menu"
            >
              <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                {user ? user.full_name.charAt(0) : <User className="w-4 h-4" />}
              </div>
              <span className="hidden md:inline text-xs font-semibold max-w-[80px] truncate">
                {user ? user.full_name.split(' ')[0] : 'Sign In'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:inline" />
            </button>

            {isAccountMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setIsAccountMenuOpen(false)}
              >
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-bold text-sm text-slate-900">{user.full_name}</div>
                      <div className="text-xs text-slate-500 truncate">{user.email}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-teal-50 text-teal-700 font-semibold text-[10px] rounded-full uppercase border border-teal-200">
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>

                    <Link
                      href="/account"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-slate-400" /> Account Overview
                    </Link>
                    <Link
                      href="/account/orders"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Package className="w-4 h-4 text-slate-400" /> My Orders
                    </Link>
                    <Link
                      href="/account/addresses"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <MapPin className="w-4 h-4 text-slate-400" /> Saved Addresses
                    </Link>

                    {role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-teal-700 hover:bg-teal-50 border-t border-slate-100"
                      >
                        <Shield className="w-4 h-4 text-teal-600" /> Admin Dashboard
                      </Link>
                    )}

                    {role === 'fisherman' && (
                      <Link
                        href="/fisherman"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 border-t border-slate-100"
                      >
                        <Anchor className="w-4 h-4 text-emerald-600" /> Fisherman Dashboard
                      </Link>
                    )}

                    {role === 'delivery_partner' && (
                      <Link
                        href="/delivery"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 border-t border-slate-100"
                      >
                        <Truck className="w-4 h-4 text-amber-600" /> Delivery Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-2">
                    <Link
                      href="/login"
                      className="block w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-center rounded-xl text-xs transition-colors"
                    >
                      Login / Register
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Button */}
          <button
            onClick={toggleCart}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm hover:shadow transition-all group"
            aria-label="Shopping Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {itemsCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-coral-500 text-white bg-[#ff6b4a] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-teal-600">
                  {itemsCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-bold">
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
            className="w-full pl-9 pr-20 py-2 text-xs bg-slate-100 rounded-full border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-teal-600 text-white rounded-full text-[11px] font-semibold"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Pills Navigation */}
      <nav className="bg-slate-50 border-t border-slate-100 hidden lg:block overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 py-1.5">
          <Link
            href="/shop"
            className="px-3 py-1 text-xs font-bold text-slate-700 hover:text-teal-700 hover:bg-white rounded-lg transition-all"
          >
            All Seafood
          </Link>
          {navCategories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
                cat.highlight
                  ? 'text-coral-600 text-[#ea580c] bg-orange-50 font-bold hover:bg-orange-100'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-white'
              }`}
            >
              {cat.highlight && <Sparkles className="w-3 h-3 text-orange-500" />}
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => {
              openLocationModal();
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-teal-50 text-teal-800 font-semibold text-xs border border-teal-200"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>Deliver to: {selectedZone ? selectedZone.area_name : selectedPincode}</span>
            </div>
            <span className="text-[11px] underline">Change</span>
          </button>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-1">
            Seafood Categories
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-xs font-bold text-slate-800"
            >
              All Seafood
            </Link>
            {navCategories.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-xs font-medium text-slate-700"
              >
                {c.name}
              </Link>
            ))}
          </div>

                    <div className="border-t border-slate-100 pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                  <span>Logged in as: <strong className="text-teal-700">{user.full_name.split(' ')[0]}</strong></span>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-600">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                {role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-50 text-teal-800 font-bold text-xs"
                  >
                    <Shield className="w-4 h-4 text-teal-600" /> Admin Dashboard
                  </Link>
                )}
                {role === 'fisherman' && (
                  <Link
                    href="/fisherman"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs"
                  >
                    <Anchor className="w-4 h-4 text-emerald-600" /> Fisherman Dashboard
                  </Link>
                )}
                {role === 'delivery_partner' && (
                  <Link
                    href="/delivery"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs"
                  >
                    <Truck className="w-4 h-4 text-amber-600" /> Delivery Fleet Hub
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 text-xs text-rose-600 font-semibold"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-teal-700 text-white rounded-xl text-xs font-bold"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
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
