'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Truck,
  ArrowLeft,
  ShieldAlert,
  Clock,
  RefreshCw,
  LogOut,
  AlertOctagon,
  Lock,
} from 'lucide-react';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, role, logout, refreshProfile } = useAuth();
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Poll / refresh profile when on pending screen to instantly unlock on admin approval
  useEffect(() => {
    if (user?.role === 'delivery_partner' && user?.status === 'pending') {
      const interval = setInterval(() => {
        refreshProfile();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [user?.role, user?.status, refreshProfile]);

  const handleManualCheck = async () => {
    setCheckingStatus(true);
    await refreshProfile();
    setCheckingStatus(false);
  };

  // Role Gate: Must be delivery_partner or admin
  if (role !== 'delivery_partner' && role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-[var(--text-primary)]">Delivery Fleet Access Only</h2>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          This portal is reserved for authorized cold-chain delivery fleet drivers. Please sign in with your delivery fleet credentials or submit an application.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/login?redirect=/delivery"
            className="w-full py-2.5 btn-aqua font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            Sign In to Delivery Fleet
          </Link>
          <Link
            href="/register-delivery"
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-[var(--text-primary)] hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Register as Delivery Fleet Partner
          </Link>
          <Link
            href="/"
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] pt-1"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  // If delivery partner status is PENDING, render the pending approval screen
  if (role === 'delivery_partner' && user?.status === 'pending') {
    return (
      <div className="max-w-xl mx-auto my-16 px-4">
        <div className="bg-[var(--surface)] rounded-3xl border border-amber-500/30 p-8 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full border border-amber-500/20">
              Pending Admin Approval
            </span>
            <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight pt-1">
              Welcome, {user.full_name}!
            </h1>
            <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
              Your delivery fleet partner application is currently under review by operations administration. Once approved, you will be able to view and accept live seafood dispatches across Visakhapatnam.
            </p>
          </div>

          <div className="p-4 bg-slate-100/50 dark:bg-slate-800/40 rounded-2xl border border-[var(--border)] text-left space-y-2 text-xs">
            <div className="font-bold text-[var(--text-primary)]">Your Registered Fleet Details:</div>
            <div className="grid grid-cols-2 gap-2 text-[var(--text-secondary)] text-[11px]">
              <div><strong className="text-[var(--text-primary)]">Driver Name:</strong> {user.full_name}</div>
              <div><strong className="text-[var(--text-primary)]">Email:</strong> {user.email}</div>
              <div><strong className="text-[var(--text-primary)]">Phone:</strong> {user.phone || '+91 98765 00000'}</div>
              <div><strong className="text-[var(--text-primary)]">Vehicle:</strong> {user.vehicle_info || 'Cold-Chain Delivery Vehicle'}</div>
              <div className="col-span-2 pt-1">
                <strong className="text-[var(--text-primary)]">Current Status:</strong>{' '}
                <span className="font-bold text-amber-600 dark:text-amber-400">Pending Operations Verification</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleManualCheck}
              disabled={checkingStatus}
              className="px-5 py-2.5 btn-aqua disabled:opacity-50 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingStatus ? 'animate-spin' : ''}`} />
              <span>{checkingStatus ? 'Checking...' : 'Check Approval Status'}</span>
            </button>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text-primary)] font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If delivery partner status is SUSPENDED or REJECTED
  if (role === 'delivery_partner' && (user?.status === 'suspended' || user?.status === 'rejected')) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-[var(--surface)] rounded-3xl border border-rose-500/30 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-[var(--text-primary)]">
          Account {user.status === 'suspended' ? 'Suspended' : 'Not Approved'}
        </h2>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Your delivery fleet partner account has been {user.status}. Please contact Fish Basket fleet administration for assistance.
        </p>
        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="px-5 py-2.5 bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs rounded-xl"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      {/* Top Delivery Partner Bar */}
      <div className="bg-[var(--surface)] text-[var(--text-primary)] px-4 sm:px-8 py-3 flex items-center justify-between border-b border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-[#00D2C4] hover:underline font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </Link>
          <span className="text-[var(--border)]">|</span>
          <div className="font-black text-sm tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <Truck className="w-4 h-4 text-teal-600 dark:text-[#00D2C4]" />
            <span>Fish Basket Fleet Partner Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="hidden sm:inline text-[var(--text-secondary)]">
            Driver: <strong className="text-[var(--text-primary)]">{user?.full_name}</strong>
          </span>
          <ThemeToggle />
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text-primary)] font-semibold rounded-xl text-xs transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</div>
    </div>
  );
}
