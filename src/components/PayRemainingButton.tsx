'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatINR } from '@/lib/cartUtils';
import { Wallet, Check, AlertCircle } from 'lucide-react';

interface PayRemainingButtonProps {
  orderId: string;
  remainingAmount: number;
  isPaid: boolean;
  orderStatus: string;
}

export default function PayRemainingButton({
  orderId,
  remainingAmount,
  isPaid,
  orderStatus,
}: PayRemainingButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (isPaid) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/20">
        <Check className="w-3.5 h-3.5" />
        <span>Remaining Balance Fully Paid via Demo Wallet</span>
      </div>
    );
  }

  if (orderStatus === 'cancelled') {
    return null;
  }

  const handlePayRemaining = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/wallet/pay-remaining', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`✓ Successfully paid ${formatINR(remainingAmount)} using Demo Wallet!`);
        router.refresh();
      } else {
        setError(data.message || 'Failed to pay remaining balance.');
      }
    } catch {
      setError('Network error while processing wallet payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 pt-2">
      <button
        type="button"
        disabled={loading}
        onClick={handlePayRemaining}
        className="w-full sm:w-auto px-4 py-2.5 btn-aqua font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Wallet className="w-4 h-4" />
        <span>
          {loading ? 'Processing...' : `Pay Remaining ${formatINR(remainingAmount)} with Demo Wallet`}
        </span>
      </button>

      {error && (
        <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
          <Check className="w-3.5 h-3.5" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}
