'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Wallet, WalletTransaction } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import {
  Wallet as WalletIcon,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function FishermanWalletPage() {
  const { user, isLoaded } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFishermanWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/wallet');
      const data = await res.json();
      if (data.success) {
        setWallet(data.wallet);
        setTransactions(data.transactions || []);
      } else {
        setError(data.message || 'Failed to load fisherman wallet.');
      }
    } catch {
      setError('Network error while loading fisherman wallet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        loadFishermanWallet();
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, user?.id]);

  if (loading) {
    return (
      <div className="bg-[var(--surface)] p-12 rounded-2xl border border-[var(--border)] text-center">
        <RefreshCw className="w-6 h-6 animate-spin text-teal-600 dark:text-[#00D2C4] mx-auto mb-2" />
        <span className="text-xs text-[var(--text-secondary)] font-semibold">Loading Fisherman Earnings Wallet...</span>
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
          onClick={loadFishermanWallet}
          className="px-4 py-2 btn-aqua font-bold text-xs rounded-xl shadow-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  // Calculate total advance received
  const totalAdvancesReleased = transactions
    .filter((t) => t.transaction_type === 'advance_release' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Simulation Notice Banner */}
      <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-start gap-3 text-xs text-[var(--text-secondary)]">
        <Sparkles className="w-5 h-5 text-teal-600 dark:text-[#00D2C4] flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-[var(--text-primary)] font-bold block mb-0.5">
            Fisherman Virtual Wallet & Escrow Ledger
          </strong>
          When a customer orders your fresh catch, their 25% advance is held in simulated escrow. It releases into your Available Virtual Balance as soon as you accept the order for preparation.
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Available Balance */}
        <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-bold uppercase tracking-wider">Available Balance</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <WalletIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {wallet ? formatINR(wallet.balance) : '₹0'}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Settled earnings from accepted and prepared catches
          </p>
        </div>

        {/* Pending Escrow Advances */}
        <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Advances</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {wallet ? formatINR(wallet.pending_balance) : '₹0'}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Held in escrow until you accept awaiting orders
          </p>
        </div>

        {/* Total Advances Released */}
        <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Advances Earned</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-[#00D2C4] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {formatINR(totalAdvancesReleased)}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Cumulative 25% advances released to date
          </p>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <h3 className="font-black text-base text-[var(--text-primary)]">Fisherman Wallet Ledger</h3>
            <p className="text-xs text-[var(--text-secondary)]">Escrow advances, releases, and catch settlements</p>
          </div>
          <button
            onClick={loadFishermanWallet}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-lg"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <ShoppingBag className="w-8 h-8 text-[var(--text-secondary)] opacity-40 mx-auto" />
            <p className="text-xs text-[var(--text-secondary)]">No wallet ledger entries yet. Accept incoming orders to receive advances.</p>
            <Link
              href="/fisherman/orders"
              className="inline-block px-4 py-2 btn-aqua font-bold text-xs rounded-xl shadow-xs mt-2"
            >
              View Incoming Orders
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {transactions.map((tx) => {
              const isCredit = tx.direction === 'credit';
              const isPending = tx.status === 'pending';
              return (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isPending
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : isCredit
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isPending ? <Clock className="w-4 h-4" /> : isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
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
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            tx.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : tx.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-slate-500/10 text-slate-600'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div
                      className={`font-black text-sm ${
                        isPending
                          ? 'text-amber-600 dark:text-amber-400'
                          : isCredit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isPending ? 'Pending: ' : isCredit ? '+' : '-'}{formatINR(tx.amount)}
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
