'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard Overview', href: '/account', icon: User },
    { name: 'My Orders', href: '/account/orders', icon: Package },
    { name: 'Saved Addresses', href: '/account/addresses', icon: MapPin },
    { name: 'Fresh Catch Wishlist', href: '/account/wishlist', icon: Heart },
    { name: 'Profile Details', href: '/account/profile', icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* User Greeting Bar */}
      <div className="bg-gradient-to-r from-teal-950 via-[#17232E] to-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-[#00D2C4] font-black text-xl flex items-center justify-center border border-teal-500/30 shadow-xs">
            {user ? user.full_name.charAt(0) : 'U'}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#00D2C4]">
              Welcome Back
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">{user?.full_name || 'Valued Customer'}</h1>
            <p className="text-xs text-slate-300">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-teal-500/10 text-[#00D2C4] text-xs font-semibold rounded-xl border border-teal-500/20">
            Member Since 2026
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-3 shadow-xs space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-700 dark:text-[#00D2C4] font-bold shadow-xs border border-teal-500/20'
                    : 'text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600 dark:text-[#00D2C4]' : 'text-[var(--text-secondary)]'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-600 dark:text-[#00D2C4]" />}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-[var(--border)]">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9">{children}</main>
      </div>
    </div>
  );
}
