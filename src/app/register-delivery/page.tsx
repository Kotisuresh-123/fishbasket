'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Truck,
  Mail,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Navigation,
  ArrowRight,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function RegisterDeliveryPartnerPage() {
  const router = useRouter();
  const { registerDeliveryPartner } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg('Please enter your full name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const result = await registerDeliveryPartner({
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 98765 00000',
      vehicle_info: vehicleInfo.trim() || 'Cold-Chain Delivery Vehicle / Insulated Cold Bag',
      password,
    });

    setIsLoading(false);

    if (result.success) {
      // Redirect to the delivery partner hub (which renders the pending approval status)
      router.push('/delivery');
    } else {
      setErrorMsg(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200/60 shadow-xs">
            <Truck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Delivery Partner Registration
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Join the Fish Basket cold-chain fleet delivering fresh catches across Visakhapatnam.
          </p>
        </div>

        {/* Pending Notice Box */}
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-start gap-3">
          <Clock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <div className="font-bold">Fleet Approval Process Notice</div>
            <div className="text-amber-800 text-[11px] leading-relaxed">
              New delivery partner registrations start in <strong>Pending</strong> status. Once operations administrators verify your vehicle and contact details, your account will be activated to accept live dispatches.
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Driver Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Varma"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@fishbasket.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Vehicle & Cold-Chain Equipment Details <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Navigation className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={vehicleInfo}
                onChange={(e) => setVehicleInfo(e.target.value)}
                placeholder="e.g. Electric Scooter with Insulated Cold Box (AP 31 XX 1234)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Create Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 bg-slate-50/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Submitting Application...' : 'Submit Delivery Fleet Application'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center space-y-2 text-xs">
          <p className="text-slate-500">
            Already registered as a fleet driver?{' '}
            <Link href="/login" className="text-amber-700 font-bold hover:underline">
              Sign In
            </Link>
          </p>
          <p className="text-slate-400 text-[11px]">
            Looking to sell fresh catches?{' '}
            <Link href="/register-fisherman" className="text-teal-700 font-bold hover:underline">
              Register as Fisherman
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
