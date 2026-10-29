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
      <div className="bg-white dark:bg-[#17232E] rounded-3xl border border-[#DCE5EA] dark:border-[#243444] p-8 shadow-sm space-y-6 transition-colors">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#00D2C4]/20 text-[#00D2C4] flex items-center justify-center mx-auto mb-2 border border-[#00D2C4]/30 shadow-xs">
            <Anchor className="w-6 h-6 text-[#00D2C4]" />
          </div>
          <h1 className="text-2xl font-black text-[#112233] dark:text-[#EAF2F8] tracking-tight">
            Sign In to Fish Basket
          </h1>
          <p className="text-xs text-[#52667A] dark:text-[#9DB0C0]">
            Secure marketplace sign-in for customers, fishermen, and staff
          </p>
        </div>

        {/* Quick Test Accounts Pill Bar */}
        <div className="p-3.5 bg-[#EDF3F5] dark:bg-[#121C25] rounded-2xl border border-[#DCE5EA] dark:border-[#243444] space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#52667A] dark:text-[#9DB0C0]">
              Test Accounts (Auto-fill)
            </span>
            <span className="text-[10px] text-[#7E92A2] dark:text-[#6B7F91] font-mono">Pass: FishBasket@2026</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <button
              type="button"
              onClick={() => fillTestCredentials('customer@fishbasket.in')}
              className="p-1.5 bg-white dark:bg-[#17232E] hover:bg-[#00D2C4]/15 text-[#112233] dark:text-[#EAF2F8] hover:text-[#00D2C4] font-semibold text-[10px] rounded-xl border border-[#DCE5EA] dark:border-[#243444] transition-colors cursor-pointer"
            >
              <User className="w-3 h-3 mx-auto mb-0.5 text-[#00D2C4]" />
              Customer
            </button>
            <button
              type="button"
              onClick={() => fillTestCredentials('fisherman1@fishbasket.in')}
              className="p-1.5 bg-white dark:bg-[#17232E] hover:bg-emerald-500/15 text-[#112233] dark:text-[#EAF2F8] hover:text-emerald-400 font-semibold text-[10px] rounded-xl border border-[#DCE5EA] dark:border-[#243444] transition-colors cursor-pointer"
            >
              <Fish className="w-3 h-3 mx-auto mb-0.5 text-emerald-500" />
              Fisherman
            </button>
            <button
              type="button"
              onClick={() => fillTestCredentials('admin@fishbasket.in')}
              className="p-1.5 bg-white dark:bg-[#17232E] hover:bg-sky-500/15 text-[#112233] dark:text-[#EAF2F8] hover:text-sky-400 font-semibold text-[10px] rounded-xl border border-[#DCE5EA] dark:border-[#243444] transition-colors cursor-pointer"
            >
              <Shield className="w-3 h-3 mx-auto mb-0.5 text-sky-500" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillTestCredentials('delivery@fishbasket.in')}
              className="p-1.5 bg-white dark:bg-[#17232E] hover:bg-amber-500/15 text-[#112233] dark:text-[#EAF2F8] hover:text-amber-400 font-semibold text-[10px] rounded-xl border border-[#DCE5EA] dark:border-[#243444] transition-colors cursor-pointer"
            >
              <Truck className="w-3 h-3 mx-auto mb-0.5 text-amber-500" />
              Delivery
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#52667A] dark:text-[#9DB0C0] mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@fishbasket.in"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-[#DCE5EA] dark:border-[#243444] bg-[#EDF3F5] dark:bg-[#0F1820] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:border-[#00D2C4] font-medium placeholder:text-[#7E92A2] dark:placeholder:text-[#6B7F91]"
              />
              <Mail className="w-4 h-4 text-[#7E92A2] dark:text-[#6B7F91] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#52667A] dark:text-[#9DB0C0]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#009E93] dark:text-[#00D2C4] hover:underline font-semibold"
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
                className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl border border-[#DCE5EA] dark:border-[#243444] bg-[#EDF3F5] dark:bg-[#0F1820] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:border-[#00D2C4] font-medium placeholder:text-[#7E92A2] dark:placeholder:text-[#6B7F91]"
              />
              <Lock className="w-4 h-4 text-[#7E92A2] dark:text-[#6B7F91] absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7E92A2] dark:text-[#6B7F91] hover:text-[#112233] dark:hover:text-[#EAF2F8] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 btn-aqua font-black text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : (
              <>
                <span>Sign In Securely</span>
                <ArrowRight className="w-4 h-4 text-[#112233]" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-[#DCE5EA] dark:border-[#243444] space-y-2 text-center text-xs">
          <div className="text-[#52667A] dark:text-[#9DB0C0]">
            Looking to buy fresh catch?{' '}
            <Link href="/register" className="text-[#009E93] dark:text-[#00D2C4] font-bold hover:underline">
              Customer Registration
            </Link>
          </div>

          <div className="text-[#52667A] dark:text-[#9DB0C0] pt-1">
            Are you a coastal fisherman?{' '}
            <Link href="/register-fisherman" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
              Register as Fisherman →
            </Link>
          </div>

          <div className="text-[#52667A] dark:text-[#9DB0C0] pt-1">
            Join cold-chain delivery fleet?{' '}
            <Link href="/register-delivery" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">
              Register as Delivery Fleet →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
