'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function NewsletterForm() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  if (subscribed) {
    return (
      <div className="p-3 bg-[#00D2C4]/20 border border-[#00D2C4]/40 rounded-xl text-[#00D2C4] text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
        <CheckCircle2 className="w-4 h-4 text-[#00D2C4]" />
        <span className="font-semibold">Subscribed! You will receive daily harbor morning catch alerts.</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 pt-2 max-w-md mx-auto"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#00D2C4] focus:ring-1 focus:ring-[#00D2C4]"
      />
      <button
        type="submit"
        className="px-6 py-2.5 btn-aqua rounded-xl text-xs font-bold transition-all shadow-sm"
      >
        Subscribe
      </button>
    </form>
  );
}
