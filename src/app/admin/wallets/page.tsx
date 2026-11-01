'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, WalletTransaction } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import {
  RefreshCw,
  AlertCircle,
  Clock,
  Users,
  Anchor,
} from 'lucide-react';

interface AdminWalletData {
  wallets: (Wallet & { email?: string; full_name?: string })[];
  recentTransactions: WalletTransaction[];
  stats: {
    totalCustomerBalance: number;
    totalFishermanBalance: number;
    totalPendingAdvance: number;
  };
}

export default function AdminWalletsPage() {
  const [data, setData] = useState<AdminWalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<'all' | 'customer' | 'fisherman'>('all');

  const loadAdminWallets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/wallets');
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.message || 'Failed to load wallet ledger.');
      }
    } catch {
      setError('Network error while loading admin wallet ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminWallets();
  }, []);

  if (loading) {
    return (
      <div className="bg-[var(--surface)] p-12 rounded-2xl border border-[var(--border)] text-center">
        <RefreshCw className="w-6 h-6 animate-spin text-teal-600 dark:text-[#00D2C4] mx-auto mb-2" />
        <span className="text-xs text-[var(--text-secondary)] font-semibold">Loading marketplace wallet ledgers...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[var(--surface)] p-8 rounded-2xl border border-red-500/20 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h3 className="font-bold text-[var(--text-primary)] text-sm">Failed to load wallet audit data</h3>
        <p className="text-xs text-[var(--text-secondary)]">{error}</p>
        <button
          onClick={loadAdminWallets}
          className="px-4 py-2 btn-aqua font-bold text-xs rounded-xl shadow-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredWallets = data.wallets.filter((w) => {
    if (filterRole === 'all') return true;
    return w.role === filterRole;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Marketplace Demo Wallets & Ledger</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Audit and reconcile virtual demo accounts, 25% advance escrow holdings, and ledger entries
          </p>
        </div>

        <button
          onClick={loadAdminWallets}
          className="px-3.5 py-2 btn-aqua font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Customer Demo Credits</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-[#00D2C4] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">
            {formatINR(data.stats.totalCustomerBalance)}
          </div>
          <span className="text-[11px] text-[var(--text-secondary)]">Available across customer accounts</span>
        </div>

        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Fisherman Virtual Balance</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Anchor className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatINR(data.stats.totalFishermanBalance)}
          </div>
          <span className="text-[11px] text-[var(--text-secondary)]">Settled earnings from accepted orders</span>
        </div>

        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pending Advance Escrow</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatINR(data.stats.totalPendingAdvance)}
          </div>
          <span className="text-[11px] text-[var(--text-secondary)]">Holds awaiting fisherman acceptance</span>
        </div>
      </div>

      {/* Wallets Table */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div>
            <h3 className="font-black text-base text-[var(--text-primary)]">User Wallets ({filteredWallets.length})</h3>
            <p className="text-xs text-[var(--text-secondary)]">Current account balances and pending balances</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-200/50 dark:bg-slate-800/60 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterRole('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterRole === 'all'
                  ? 'bg-[var(--surface)] text-teal-700 dark:text-[#00D2C4] shadow-xs font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              All ({data.wallets.length})
            </button>
            <button
              onClick={() => setFilterRole('customer')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterRole === 'customer'
                  ? 'bg-[var(--surface)] text-teal-700 dark:text-[#00D2C4] shadow-xs font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Customers ({data.wallets.filter((w) => w.role === 'customer').length})
            </button>
            <button
              onClick={() => setFilterRole('fisherman')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterRole === 'fisherman'
                  ? 'bg-[var(--surface)] text-teal-700 dark:text-[#00D2C4] shadow-xs font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Fishermen ({data.wallets.filter((w) => w.role === 'fisherman').length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/50 dark:bg-slate-800/40 text-[var(--text-secondary)] uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3 text-right">Available Balance</th>
                <th className="py-2.5 px-3 text-right">Pending Escrow</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredWallets.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-[var(--text-primary)]">{w.full_name || 'Unnamed User'}</div>
                    <div className="text-[11px] text-[var(--text-secondary)]">{w.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-500/10 text-teal-700 dark:text-[#00D2C4] border border-teal-500/20">
                      {w.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-black text-sm text-[var(--text-primary)]">
                    {formatINR(w.balance)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-xs text-amber-600">
                    {formatINR(w.pending_balance)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[11px] text-[var(--text-secondary)]">
                    {new Date(w.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Ledger Entries Table */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-xs space-y-4">
        <div className="border-b border-[var(--border)] pb-3">
          <h3 className="font-black text-base text-[var(--text-primary)]">Recent Ledger Transactions (Audit Log)</h3>
          <p className="text-xs text-[var(--text-secondary)]">Chronological double-entry transactions across all marketplace users</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/50 dark:bg-slate-800/40 text-[var(--text-secondary)] uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-right">Balance After</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {data.recentTransactions.map((tx) => {
                const isCredit = tx.direction === 'credit';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-2.5 px-3 text-[11px] text-[var(--text-secondary)] whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] font-bold">
                      {tx.transaction_type}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-[var(--text-primary)]">
                      {tx.description}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-[var(--text-secondary)]">
                      {tx.reference_id || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black">
                      <span className={isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {isCredit ? '+' : '-'}{formatINR(tx.amount)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[var(--text-primary)]">
                      {formatINR(tx.balance_after)}
                    </td>
                    <td className="py-2.5 px-3">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
