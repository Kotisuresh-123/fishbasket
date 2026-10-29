'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const result = await register({
      full_name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 98765 00000',
      password,
    });

    setIsLoading(false);

    if (result.success) {
      router.push('/account');
    } else {
      setErrorMsg(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="bg-white dark:bg-[#17232E] rounded-3xl border border-[#DCE5EA] dark:border-[#243444] p-8 shadow-sm space-y-6 transition-colors">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-[#112233] dark:text-[#EAF2F8] tracking-tight">
            Create Customer Account
          </h1>
          <p className="text-xs text-[#52667A] dark:text-[#9DB0C0]">
            Join Fish Basket for doorstep delivery of daily harbor catches
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#52667A] dark:text-[#9DB0C0] mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Varma"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-[#DCE5EA] dark:border-[#243444] bg-[#EDF3F5] dark:bg-[#0F1820] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:border-[#00D2C4] font-medium placeholder:text-[#7E92A2] dark:placeholder:text-[#6B7F91]"
              />
              <User className="w-4 h-4 text-[#7E92A2] dark:text-[#6B7F91] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#52667A] dark:text-[#9DB0C0] mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-[#DCE5EA] dark:border-[#243444] bg-[#EDF3F5] dark:bg-[#0F1820] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:border-[#00D2C4] font-medium placeholder:text-[#7E92A2] dark:placeholder:text-[#6B7F91]"
              />
              <Mail className="w-4 h-4 text-[#7E92A2] dark:text-[#6B7F91] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#52667A] dark:text-[#9DB0C0] mb-1">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-[#DCE5EA] dark:border-[#243444] bg-[#EDF3F5] dark:bg-[#0F1820] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:border-[#00D2C4] font-medium placeholder:text-[#7E92A2] dark:placeholder:text-[#6B7F91]"
              />
              <Phone className="w-4 h-4 text-[#7E92A2] dark:text-[#6B7F91] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#52667A] dark:text-[#9DB0C0] mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
              <span className="animate-pulse">Creating Account...</span>
            ) : (
              <>
                <span>Create Customer Account</span>
                <ArrowRight className="w-4 h-4 text-[#112233]" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-[#DCE5EA] dark:border-[#243444] text-center text-xs">
          <span className="text-[#52667A] dark:text-[#9DB0C0]">Already have an account? </span>
          <Link href="/login" className="text-[#009E93] dark:text-[#00D2C4] font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
