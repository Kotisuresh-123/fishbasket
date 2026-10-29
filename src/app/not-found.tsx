import React from 'react';
import Link from 'next/link';
import { Compass, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-[var(--surface)] p-8 sm:p-10 rounded-3xl border border-[var(--border)] shadow-xl animate-in fade-in">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#00D2C4]/15 text-[#00D2C4] border border-[#00D2C4]/20 flex items-center justify-center">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold tracking-widest text-[#00D2C4] uppercase bg-[#00D2C4]/10 px-3 py-1 rounded-full border border-[#00D2C4]/20">
            Error 404
          </span>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Lost at Sea?
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            The seafood catch or page you are looking for has drifted off our harbor waters or does not exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 btn-aqua rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Fresh Catches</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
