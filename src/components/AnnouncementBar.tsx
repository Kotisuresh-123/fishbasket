'use client';

import React, { useState } from 'react';
import { Sparkles, X, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-flex items-center gap-1 bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full text-[11px] font-medium border border-teal-500/30">
            <Sparkles className="w-3 h-3" /> Today's Catch
          </span>
          <span className="hidden sm:inline text-slate-300">
            Directly from harbor trawlers • 100% Chemical & Formalin Free
          </span>
          <span className="sm:hidden text-slate-200">
            Harbor Fresh Catch • Free delivery above ₹499
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <div className="hidden md:flex items-center gap-1.5 text-[11px]">
            <Truck className="w-3.5 h-3.5 text-teal-400" />
            <span>FREE Chilled Delivery on ₹499+</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>100% Freshness Guarantee</span>
          </div>
          <Link
            href="/offers"
            className="text-amber-300 hover:text-amber-200 font-semibold underline underline-offset-2 text-[11px]"
          >
            Use Code FRESH100
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss announcement"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
