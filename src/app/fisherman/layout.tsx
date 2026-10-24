'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Anchor,
  Fish,
  ShoppingBag,
  Star,
  Settings,
  Clock,
  AlertOctagon,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  PlusCircle,
  RefreshCw,
  User,
} from 'lucide-react';

export default function FishermanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isAuthenticated, logout, refreshProfile } = useAuth();
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Poll / refresh profile when on pending screen to instantly unlock on admin approval
  useEffect(() => {
    if (user?.status === 'pending') {
      const interval = setInterval(() => {
        refreshProfile();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [user?.status, refreshProfile]);

  const handleManualCheck = async () => {
    setCheckingStatus(true);
    await refreshProfile();
    setCheckingStatus(false);
  };

  // If unauthenticated or not a fisherman, render access gate
  if (!isAuthenticated || role !== 'fisherman') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <AlertOctagon className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Fisherman Portal Access</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          This portal is reserved for registered fishermen. Please sign in with your fisherman credentials or submit an application.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/login"
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Sign In with Fisherman Account
          </Link>
          <Link
            href="/register-fisherman"
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Register as a Fisherman
          </Link>
        </div>
      </div>
    );
  }

  // If fisherman status is PENDING, render the pending approval screen
  if (user?.status === 'pending') {
    return (
      <div className="max-w-xl mx-auto my-16 px-4">
        <div className="bg-white rounded-3xl border border-amber-200/90 p-8 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-amber-100 text-amber-900 rounded-full">
              Pending Approval
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
              Welcome, {user.display_name || user.full_name}!
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Your account is waiting for admin approval. Once approved, you will be able to add and manage your fresh catches.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left space-y-2 text-xs">
            <div className="font-bold text-slate-800">Your Registered Details:</div>
            <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
              <div><strong>Fisherman Name:</strong> {user.display_name || user.full_name}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Landing Dock:</strong> {user.dock_location || 'Visakhapatnam Harbor'}</div>
              <div><strong>Status:</strong> <span className="font-bold text-amber-700">Pending Admin Approval</span></div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleManualCheck}
              disabled={checkingStatus}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingStatus ? 'animate-spin' : ''}`} />
              <span>{checkingStatus ? 'Checking...' : 'Check Approval Status'}</span>
            </button>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If fisherman status is SUSPENDED or REJECTED
  if (user?.status === 'suspended' || user?.status === 'rejected') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <AlertOctagon className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Account Selling Suspended</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Selling has been disabled for your fisherman account. Please contact marketplace administration for assistance.
        </p>
        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // Clean 5 primary destinations requested in Section 8
  const navLinks = [
    { href: '/fisherman', label: 'Overview', icon: LayoutDashboard },
    { href: '/fisherman/products/new', label: 'Add Catch', icon: PlusCircle },
    { href: '/fisherman/products', label: 'My Catches', icon: Fish },
    { href: '/fisherman/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/fisherman/reviews', label: 'Reviews', icon: Star },
    { href: '/fisherman/settings', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Fisherman Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider block">
                Fisherman Dashboard
              </span>
              <h1 className="text-sm font-bold text-slate-900 leading-none">
                {user?.display_name || user?.full_name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-lg border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Approved Fisherman
            </span>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto border-t border-slate-100 py-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === '/fisherman'
                ? pathname === '/fisherman'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</div>
    </div>
  );
}
