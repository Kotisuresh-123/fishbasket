'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Fish,
  Anchor,
  Shield,
  Truck,
  User,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (result.success && result.role) {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get('redirect');
        if (redirectUrl) {
          if (redirectUrl.startsWith('/admin') && result.role === 'admin') {
            router.push(redirectUrl);
            return;
          }
          if (redirectUrl.startsWith('/fisherman') && result.role === 'fisherman') {
            router.push(redirectUrl);
            return;
          }
          if (redirectUrl.startsWith('/delivery') && (result.role === 'delivery_partner' || result.role === 'admin')) {
            router.push(redirectUrl);
            return;
          }
        }
      }

      // Redirect based on server-verified role
      switch (result.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'fisherman':
          router.push('/fisherman');
          break;
        case 'delivery_partner':
          router.push('/delivery');
          break;
        case 'customer':
        default:
          router.push('/account');
          break;
      }
    } else {
      setErrorMsg(result.message || 'Invalid email or password. Please try again.');
    }
  };

  // Fast test fill helper for evaluation
  const fillTestCredentials = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('FishBasket@2026');
    setErrorMsg(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-2 border border-teal-200/60 shadow-xs">
            <Anchor className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to Fish Basket
          </h1>
          <p className="text-xs text-slate-500">
            Secure marketplace sign-in for customers, fishermen, and staff
          </p>
        </div>

        {/* Quick Test Accounts Pill Bar */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Test Accounts (Auto-fill)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Pass: FishBasket@2026</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <button
              type="button"
              onClick={() => fillTestCredentials('customer@fishbasket.in')}
              className="p-1.5 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 font-semibold text-[10px] rounded-lg border border-slate-200 transition-colors"
            >
              <User className="w-3 h-3 mx-auto mb-0.5 text-teal-600" />
              Customer
            </button>
            <button
              type="button"
              onClick={() => fillTestCredentials('fisherman1@fishbasket.in')}
              className="p-1.5 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 font-semibold text-[10px] rounded-lg border border-slate-200 transition-colors"
            >
              <Fish className="w-3 h-3 mx-auto mb-0.5 text-emerald-600" />
              Fisherman
            </button>
            <button
              type="button"
              onClick={() => fillTestCredentials('admin@fishbasket.in')}
              className="p-1.5 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 font-semibold text-[10px] rounded-lg border border-slate-200 transition-colors"
            >
              <Shield className="w-3 h-3 mx-auto mb-0.5 text-sky-600" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillTestCredentials('delivery@fishbasket.in')}
              className="p-1.5 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 font-semibold text-[10px] rounded-lg border border-slate-200 transition-colors"
            >
              <Truck className="w-3 h-3 mx-auto mb-0.5 text-amber-600" />
              Delivery
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@fishbasket.in"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-medium"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-medium"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : (
              <>
                <span>Sign In Securely</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 space-y-2 text-center text-xs">
          <div className="text-slate-500">
            Looking to buy fresh catch?{' '}
            <Link href="/register" className="text-teal-700 font-bold hover:underline">
              Customer Registration
            </Link>
          </div>

          <div className="text-slate-500 pt-1">
            Are you a coastal fisherman?{' '}
            <Link href="/register-fisherman" className="text-emerald-700 font-bold hover:underline">
              Register as Fisherman →
            </Link>
          </div>

          <div className="text-slate-500 pt-1">
            Join cold-chain delivery fleet?{' '}
            <Link href="/register-delivery" className="text-amber-700 font-bold hover:underline">
              Register as Delivery Fleet →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
