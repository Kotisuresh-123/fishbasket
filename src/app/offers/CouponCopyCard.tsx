'use client';

import React, { useState } from 'react';
import { Coupon } from '@/types';
import { useCart } from '@/context/CartContext';
import { Tag, Copy, Check } from 'lucide-react';
import { formatINR } from '@/lib/cartUtils';

interface CouponCopyCardProps {
  coupon: Coupon;
}

export default function CouponCopyCard({ coupon }: CouponCopyCardProps) {
  const { applyCoupon, toggleCart } = useCart();
  const [copied, setCopied] = useState(false);
  const [appliedMsg, setAppliedMsg] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = async () => {
    const res = await applyCoupon(coupon.code);
    setAppliedMsg(res.message);
    toggleCart();
    setTimeout(() => setAppliedMsg(null), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-teal-300 p-5 shadow-xs relative overflow-hidden group hover:border-teal-500 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-mono text-base font-black text-teal-800 tracking-wider bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 inline-block">
            {coupon.code}
          </span>
          <p className="text-xs text-slate-600 mt-2 font-medium">
            {coupon.description}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="p-2 rounded-xl text-slate-400 hover:text-teal-700 hover:bg-slate-50 transition-colors"
          title="Copy Code"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400">
          Min order: {formatINR(coupon.min_order_amount)}
        </span>
        <button
          onClick={handleApply}
          className="text-xs font-bold text-teal-700 hover:text-teal-800 underline underline-offset-2"
        >
          Apply to Cart →
        </button>
      </div>

      {appliedMsg && (
        <div className="mt-2 text-[10px] text-teal-800 font-semibold bg-teal-50 p-1.5 rounded text-center">
          {appliedMsg}
        </div>
      )}
    </div>
  );
}
