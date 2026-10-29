'use client';

import React, { useState } from 'react';
import { Sparkles, X, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-[#0E1720] dark:bg-[#070D12] text-slate-200 text-xs py-2 px-4 border-b border-slate-800/80 dark:border-slate-800/50 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-flex items-center gap-1 bg-[#00D2C4]/15 text-[#00D2C4] px-2 py-0.5 rounded-full text-[11px] font-bold border border-[#00D2C4]/30">
            <Sparkles className="w-3 h-3 text-[#00D2C4]" /> Today's Catch
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
            <Truck className="w-3.5 h-3.5 text-[#00D2C4]" />
            <span>FREE Chilled Delivery on ₹499+</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00D2C4]" />
            <span>100% Freshness Guarantee</span>
          </div>
          <Link
            href="/offers"
            className="text-[#00D2C4] hover:text-[#1AE0D3] font-bold underline underline-offset-2 text-[11px] transition-colors"
          >
            Use Code FRESH100
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss announcement"
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
