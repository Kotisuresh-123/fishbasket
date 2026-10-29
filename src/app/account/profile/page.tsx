'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Phone, Mail, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-2xl border border-[var(--border)] shadow-xs max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Profile Details</h2>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Update your contact details for seafood delivery notifications
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-[var(--text-primary)] mb-1">Full Name</label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:border-[#00D2C4] focus:ring-1 focus:ring-[#00D2C4] font-medium transition-colors"
            />
            <User className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[var(--text-primary)] mb-1">Email Address (Read Only)</label>
          <div className="relative">
            <input
              type="email"
              disabled
              value={email}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border)] bg-slate-100/50 dark:bg-slate-800/40 text-[var(--text-secondary)] font-medium cursor-not-allowed opacity-80"
            />
            <Mail className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-[var(--text-primary)] mb-1">Phone Number</label>
          <div className="relative">
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:border-[#00D2C4] focus:ring-1 focus:ring-[#00D2C4] font-medium transition-colors"
            />
            <Phone className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 btn-aqua font-bold rounded-xl transition-all shadow-xs"
          >
            Save Changes
          </button>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Profile details updated successfully!</span>
          </div>
        )}
      </form>
    </div>
  );
}
