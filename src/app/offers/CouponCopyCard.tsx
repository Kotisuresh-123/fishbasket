'use client';

import React, { useState } from 'react';
import { Coupon } from '@/types';
import { useCart } from '@/context/CartContext';
import { Copy, Check } from 'lucide-react';
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
    <div className="bg-white dark:bg-[#17232E] rounded-2xl border-2 border-dashed border-[#00D2C4]/40 hover:border-[#00D2C4] p-5 shadow-xs relative overflow-hidden group transition-all">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-mono text-base font-black text-[#009E93] dark:text-[#00D2C4] tracking-wider bg-[#00D2C4]/15 px-2.5 py-1 rounded-lg border border-[#00D2C4]/30 inline-block">
            {coupon.code}
          </span>
          <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] mt-2 font-medium">
            {coupon.description}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="p-2 rounded-xl text-[#7E92A2] dark:text-[#6B7F91] hover:text-[#00D2C4] hover:bg-[#00D2C4]/10 transition-colors cursor-pointer"
          title="Copy Code"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-[#DCE5EA] dark:border-[#243444] flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#7E92A2] dark:text-[#6B7F91]">
          Min order: {formatINR(coupon.min_order_amount)}
        </span>
        <button
          onClick={handleApply}
          className="btn-aqua px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
        >
          Apply to Cart →
        </button>
      </div>

      {appliedMsg && (
        <div className="mt-2 text-[10px] text-[#009E93] dark:text-[#00D2C4] font-semibold bg-[#00D2C4]/15 p-1.5 rounded-lg border border-[#00D2C4]/30 text-center">
          {appliedMsg}
        </div>
      )}
    </div>
  );
}
