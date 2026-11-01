'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Wallet, WalletTransaction } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import {
  Wallet as WalletIcon,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Clock,
} from 'lucide-react';

export default function CustomerWalletPage() {
  const { user, isLoaded } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Top-Up Modal/Form State
  const [customAmount, setCustomAmount] = useState('500');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topUpSuccess, setTopUpSuccess] = useState<string | null>(null);
  const [topUpError, setTopUpError] = useState<string | null>(null);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/wallet');
      const data = await res.json();
      if (data.success) {
        setWallet(data.wallet);
        setTransactions(data.transactions || []);
      } else {
        setError(data.message || 'Failed to load wallet data.');
      }
    } catch {
      setError('Network error while loading wallet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        loadWalletData();
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, user?.id]);

  const handleTopUp = async (amountToCredit: number) => {
    setIsSubmitting(true);
    setTopUpError(null);
    setTopUpSuccess(null);

    try {
      const res = await fetch('/api/wallet/top-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountToCredit,
          idempotencyKey: `topup_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        }),
      });

      const data = await res.json();
      if (data.success && data.wallet) {
        setWallet(data.wallet);
        if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev]);
        }
        setTopUpSuccess(`✓ Successfully added ₹${amountToCredit} demo credits to your wallet!`);
      } else {
        setTopUpError(data.message || 'Failed to process top-up.');
      }
    } catch {
      setTopUpError('Network error while processing demo top-up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--surface)] p-12 rounded-2xl border border-[var(--border)] text-center">
        <RefreshCw className="w-6 h-6 animate-spin text-teal-600 dark:text-[#00D2C4] mx-auto mb-2" />
        <span className="text-xs text-[var(--text-secondary)] font-semibold">Loading your Demo Wallet...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--surface)] p-8 rounded-2xl border border-red-500/20 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h3 className="font-bold text-[var(--text-primary)] text-sm">Unable to load wallet</h3>
        <p className="text-xs text-[var(--text-secondary)]">{error}</p>
        <button
          onClick={loadWalletData}
          className="px-4 py-2 btn-aqua font-bold text-xs rounded-xl shadow-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simulation Notice Banner */}
      <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-start gap-3 text-xs text-[var(--text-secondary)]">
        <Sparkles className="w-5 h-5 text-teal-600 dark:text-[#00D2C4] flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-[var(--text-primary)] font-bold block mb-0.5">
            Simulated Demo Financial System
          </strong>
          This virtual wallet uses simulated money for the Fish Basket marketplace demonstration. No real bank accounts, UPI, or cards are charged.
        </div>
      </div>

      {/* Main Balance & Action Card */}
      <div className="bg-gradient-to-br from-teal-950 via-[#17232E] to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-[var(--border)] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-teal-400 flex items-center gap-1.5">
              <WalletIcon className="w-4 h-4" /> Available Demo Balance
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {wallet ? formatINR(wallet.balance) : '₹0'}
            </div>
            <p className="text-xs text-slate-300">
              Used to pay the mandatory 25% catch reservation advance and optional full order payments.
            </p>
          </div>

          {/* Quick Add Demo Funds */}
          <div className="bg-white/10 dark:bg-black/20 p-4 rounded-2xl border border-white/10 space-y-3 min-w-[260px]">
            <span className="text-xs font-bold text-teal-300 block">Add Demo Funds (Simulation)</span>
            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 2000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleTopUp(amt)}
                  className="py-1.5 px-2 bg-teal-500/20 hover:bg-teal-500/30 text-[#00D2C4] border border-teal-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min={100}
                max={10000}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Amount (₹)"
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-900/60 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-[#00D2C4]"
              />
              <button
                type="button"
                disabled={isSubmitting || !customAmount}
                onClick={() => handleTopUp(Number(customAmount))}
                className="px-3 py-1.5 btn-aqua font-bold text-xs rounded-xl whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Top Up'}
              </button>
            </div>
          </div>
        </div>

        {topUpSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{topUpSuccess}</span>
          </div>
        )}

        {topUpError && (
          <div className="mt-4 p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{topUpError}</span>
          </div>
        )}
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <h3 className="font-black text-base text-[var(--text-primary)]">Demo Wallet Ledger</h3>
            <p className="text-xs text-[var(--text-secondary)]">Complete immutable record of credits, debits, and refunds</p>
          </div>
          <button
            onClick={loadWalletData}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-lg"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Clock className="w-8 h-8 text-[var(--text-secondary)] opacity-40 mx-auto" />
            <p className="text-xs text-[var(--text-secondary)]">No wallet transactions recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {transactions.map((tx) => {
              const isCredit = tx.direction === 'credit';
              return (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCredit
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[var(--text-primary)] truncate">{tx.description}</div>
                      <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-2">
                        <span>{new Date(tx.created_at).toLocaleString()}</span>
                        {tx.reference_id && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[10px]">{tx.reference_id}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div
                      className={`font-black text-sm ${
                        isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isCredit ? '+' : '-'}{formatINR(tx.amount)}
                    </div>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      Bal: {formatINR(tx.balance_after)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
