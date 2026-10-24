'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Delivery Fleet Access Only</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          This portal is reserved for authorized cold-chain delivery fleet drivers. Please sign in with your delivery fleet credentials or submit an application.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/login?redirect=/delivery"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Sign In to Delivery Fleet
          </Link>
          <Link
            href="/register-delivery"
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Register as Delivery Fleet Partner
          </Link>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-600 pt-1"
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
        <div className="bg-white rounded-3xl border border-amber-200/90 p-8 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-amber-100 text-amber-900 rounded-full">
              Pending Admin Approval
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
              Welcome, {user.full_name}!
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Your delivery fleet partner application is currently under review by operations administration. Once approved, you will be able to view and accept live seafood dispatches across Visakhapatnam.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left space-y-2 text-xs">
            <div className="font-bold text-slate-800">Your Registered Fleet Details:</div>
            <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
              <div><strong>Driver Name:</strong> {user.full_name}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Phone:</strong> {user.phone || '+91 98765 00000'}</div>
              <div><strong>Vehicle:</strong> {user.vehicle_info || 'Cold-Chain Delivery Vehicle'}</div>
              <div className="col-span-2 pt-1">
                <strong>Current Status:</strong>{' '}
                <span className="font-bold text-amber-700">Pending Operations Verification</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleManualCheck}
              disabled={checkingStatus}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
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

  // If delivery partner status is SUSPENDED or REJECTED
  if (role === 'delivery_partner' && (user?.status === 'suspended' || user?.status === 'rejected')) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-red-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">
          Account {user.status === 'suspended' ? 'Suspended' : 'Not Approved'}
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your delivery fleet partner account has been {user.status}. Please contact Fish Basket fleet administration for assistance.
        </p>
        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="px-5 py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70">
      {/* Top Delivery Partner Bar */}
      <div className="bg-slate-900 text-white px-4 sm:px-8 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-teal-300 hover:text-white font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </Link>
          <span className="text-slate-700">|</span>
          <div className="font-black text-sm tracking-tight text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Fish Basket Fleet Partner Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="hidden sm:inline text-slate-300">
            Driver: <strong className="text-white">{user?.full_name}</strong>
          </span>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</div>
    </div>
  );
}
