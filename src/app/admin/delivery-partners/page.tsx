'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import {
  Truck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  Lock,
  Unlock,
  Navigation,
} from 'lucide-react';

export default function AdminDeliveryPartnersPage() {
  const [partners, setPartners] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/delivery-partners');
      const data = await res.json();
      if (data.success) {
        setPartners(data.partners || []);
      }
    } catch (err) {
      console.error('Failed to load delivery partners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected' | 'pending' | 'suspended') => {
    setUpdatingId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/auth/delivery-partners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setPartners((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
        setFeedback({ message: data.message || `Delivery partner status updated to ${newStatus}.`, type: 'success' });
      } else {
        setFeedback({ message: data.message || 'Failed to update partner status.', type: 'error' });
      }
    } catch {
      setFeedback({ message: 'Network error updating partner status.', type: 'error' });
    } finally {
      setUpdatingId(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const filtered = partners.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch =
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone && p.phone.includes(search)) ||
      (p.vehicle_info && p.vehicle_info.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: partners.length,
    pending: partners.filter((p) => p.status === 'pending').length,
    approved: partners.filter((p) => p.status === 'approved').length,
    suspended: partners.filter((p) => p.status === 'suspended').length,
    rejected: partners.filter((p) => p.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
            Delivery Fleet Management
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Admin oversight, KYC verification, vehicle approval & active route dispatch status
          </p>
        </div>

        <button
          onClick={fetchPartners}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-semibold rounded-xl hover:border-teal-500/40 transition-colors self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-teal-600 dark:text-[#00D2C4] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
            Total Fleet
          </span>
          <div className="text-2xl font-black text-[var(--text-primary)]">{counts.all}</div>
          <span className="text-xs text-[var(--text-secondary)] mt-1 block">Registered drivers</span>
        </div>

        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
            Pending Approval
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{counts.pending}</div>
          <span className="text-xs text-amber-600 dark:text-amber-400 mt-1 block">Needs verification</span>
        </div>

        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
            Active / Approved
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{counts.approved}</div>
          <span className="text-xs text-[var(--text-secondary)] mt-1 block">Can accept dispatches</span>
        </div>

        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
            Suspended / Inactive
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{counts.suspended + counts.rejected}</div>
          <span className="text-xs text-[var(--text-secondary)] mt-1 block">Access blocked</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'pending', 'approved', 'suspended', 'rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-teal-500/10 text-teal-700 dark:text-[#00D2C4] border border-teal-500/30'
                    : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
                }`}
              >
                {st === 'all' ? 'All Fleet' : st} ({counts[st] || 0})
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver, phone, vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[var(--border)] text-xs focus:outline-none focus:border-[#00D2C4] bg-[var(--surface-elevated)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
            />
          </div>
        </div>

        {/* Fleet Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] font-bold uppercase text-[10px] tracking-wider bg-[var(--surface-elevated)]">
                <th className="py-2.5 pl-3">Driver Profile</th>
                <th className="py-2.5">Contact Details</th>
                <th className="py-2.5">Vehicle & Cold-Chain Info</th>
                <th className="py-2.5">Joined Date</th>
                <th className="py-2.5">Approval Status</th>
                <th className="py-2.5 pr-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--text-secondary)]">
                    Loading delivery partner fleet...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--text-secondary)]">
                    No delivery partners matching filter.
                  </td>
                </tr>
              ) : (
                filtered.map((partner) => {
                  const isUpdating = updatingId === partner.id;

                  return (
                    <tr key={partner.id} className="hover:bg-[var(--surface-elevated)]/60 transition-colors">
                      {/* Driver Profile */}
                      <td className="py-3.5 pl-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-700 dark:text-[#00D2C4] border border-teal-500/20 flex items-center justify-center font-black text-xs shrink-0">
                            {partner.full_name?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <div className="font-bold text-[var(--text-primary)]">{partner.full_name}</div>
                            <div className="text-[10px] text-[var(--text-secondary)] font-mono">ID: {partner.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="py-3.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
                            <Mail className="w-3 h-3 text-[var(--text-secondary)]" />
                            <span>{partner.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-[11px]">
                            <Phone className="w-3 h-3 text-[var(--text-secondary)]" />
                            <span>{partner.phone || 'No phone recorded'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Vehicle Info */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-medium">
                          <Navigation className="w-3 h-3 text-teal-600 dark:text-[#00D2C4] shrink-0" />
                          <span>{partner.vehicle_info || 'Cold-Chain Insulated Van'}</span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 text-[var(--text-secondary)] text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {partner.created_at
                              ? new Date(partner.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'Earlier'}
                          </span>
                        </div>
                      </td>

                      {/* Approval Status */}
                      <td className="py-3.5">
                        {partner.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved</span>
                          </span>
                        ) : partner.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Pending Review</span>
                          </span>
                        ) : partner.status === 'suspended' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                            <Lock className="w-3 h-3" />
                            <span>Suspended</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-[var(--text-secondary)] border border-slate-500/20">
                            <XCircle className="w-3 h-3" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {partner.status !== 'approved' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(partner.id, 'approved')}
                              className="btn-aqua px-3 py-1 disabled:opacity-50 font-bold text-[11px] rounded-lg transition-colors shadow-xs"
                              title="Approve driver to accept dispatches"
                            >
                              Approve
                            </button>
                          )}

                          {partner.status === 'pending' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(partner.id, 'rejected')}
                              className="px-2.5 py-1 bg-[var(--surface-elevated)] hover:bg-rose-500/10 hover:text-rose-600 border border-[var(--border)] disabled:opacity-50 text-[var(--text-secondary)] font-bold text-[11px] rounded-lg transition-colors"
                              title="Reject registration application"
                            >
                              Reject
                            </button>
                          )}

                          {partner.status === 'approved' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(partner.id, 'suspended')}
                              className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/20 disabled:opacity-50 font-bold text-[11px] rounded-lg transition-colors"
                              title="Temporarily suspend fleet driver access"
                            >
                              Suspend
                            </button>
                          )}

                          {partner.status === 'suspended' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(partner.id, 'approved')}
                              className="btn-aqua px-2.5 py-1 disabled:opacity-50 font-bold text-[11px] rounded-lg transition-colors"
                              title="Reactivate driver access"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
