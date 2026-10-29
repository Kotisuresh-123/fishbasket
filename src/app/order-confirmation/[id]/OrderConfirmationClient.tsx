'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2 } from 'lucide-react';

interface OrderConfirmationClientProps {
  orderNumber: string;
}

export default function OrderConfirmationClient({ orderNumber }: OrderConfirmationClientProps) {
  useEffect(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#00D2C4', '#1AE0D3', '#ff6b4a', '#f59e0b'],
      });
    } catch {
      // Ignore if canvas unsupported
    }
  }, []);

  return (
    <div className="text-center space-y-2">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <h1 className="text-2xl sm:text-4xl font-black text-[#112233] dark:text-[#EAF2F8] tracking-tight">
        Order Placed Successfully!
      </h1>
      <p className="text-xs sm:text-sm text-[#52667A] dark:text-[#9DB0C0]">
        Thank you for choosing Fish Basket. Your order number is{' '}
        <strong className="text-[#112233] dark:text-[#EAF2F8] font-mono font-bold bg-[#EDF3F5] dark:bg-[#121C25] px-2 py-0.5 rounded-lg border border-[#DCE5EA] dark:border-[#243444]">
          {orderNumber}
        </strong>
      </p>
    </div>
  );
}
