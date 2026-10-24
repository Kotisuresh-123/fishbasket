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
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#14b8a6', '#ff6b4a', '#f59e0b'],
      });
    } catch {
      // Ignore if canvas unsupported
    }
  }, []);

  return (
    <div className="text-center space-y-2">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
        Order Placed Successfully!
      </h1>
      <p className="text-xs sm:text-sm text-slate-500">
        Thank you for choosing Fish Basket. Your order number is{' '}
        <strong className="text-slate-900 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">
          {orderNumber}
        </strong>
      </p>
    </div>
  );
}
