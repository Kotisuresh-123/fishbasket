'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, FishermanStatus } from '@/types';
import {
  Anchor,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  Lock,
  Unlock,
} from 'lucide-react';

export default function AdminFishermenPage() {
  const [fishermen, setFishermen] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchFishermen = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/fishermen');
      const data = await res.json();
      if (data.success) {
        setFishermen(data.fishermen || []);
      }
    } catch (err) {
      console.error('Failed to load fishermen:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFishermen();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: FishermanStatus) => {
    setUpdatingId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/auth/fishermen/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setFishermen((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
        );
        setFeedback({ message: data.message || `Fisherman status updated to ${newStatus}.`, type: 'success' });
      } else {
        setFeedback({ message: data.message || 'Failed to update fisherman status.', type: 'error' });
      }
    } catch {
      setFeedback({ message: 'Network error updating status.', type: 'error' });
    } finally {
      setUpdatingId(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const filtered = fishermen.filter((f) => {
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    const matchesSearch =
      (f.display_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      f.full_name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      (f.dock_location?.toLowerCase() || '').includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: fishermen.length,
    pending: fishermen.filter((f) => f.status === 'pending').length,
    approved: fishermen.filter((f) => f.status === 'approved').length,
    suspended: fishermen.filter((f) => f.status === 'suspended').length,
    rejected: fishermen.filter((f) => f.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
            Fisherman Management
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Approve applicant fishermen, verify harbor dock landing centers, and manage selling privileges
          </p>
        </div>

        <button
          onClick={fetchFishermen}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-semibold rounded-xl hover:border-teal-500/40 transition-colors self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-600 dark:text-[#00D2C4]" />
          <span>Refresh Fishermen</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Metric Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { key: 'all', label: 'All Registered', count: counts.all, color: 'text-[var(--text-primary)]' },
          { key: 'pending', label: 'Pending Approval', count: counts.pending, color: 'text-amber-600 dark:text-amber-400' },
          { key: 'approved', label: 'Active Approved', count: counts.approved, color: 'text-emerald-600 dark:text-emerald-400' },
          { key: 'suspended', label: 'Suspended', count: counts.suspended, color: 'text-rose-600 dark:text-rose-400' },
          { key: 'rejected', label: 'Rejected', count: counts.rejected, color: 'text-[var(--text-secondary)]' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`p-3 rounded-2xl border text-left transition-all ${
              statusFilter === tab.key
                ? 'bg-[var(--surface-elevated)] border-[#00D2C4] shadow-xs ring-2 ring-[#00D2C4]/20'
                : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--text-secondary)]'
            }`}
          >
            <div className={`text-xl font-black ${tab.color}`}>{tab.count}</div>
            <div className="text-[11px] font-semibold text-[var(--text-secondary)] mt-0.5">{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Filter and Search */}
      <div className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search fisherman name, boat, dock, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#00D2C4]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[var(--text-secondary)] font-medium">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[var(--border)] font-semibold bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4]"
          >
            <option value="all">All Statuses ({counts.all})</option>
            <option value="pending">Pending ({counts.pending})</option>
            <option value="approved">Approved ({counts.approved})</option>
            <option value="suspended">Suspended ({counts.suspended})</option>
            <option value="rejected">Rejected ({counts.rejected})</option>
          </select>
        </div>
      </div>

      {/* Fishermen List */}
      {loading ? (
        <div className="bg-[var(--surface)] p-12 rounded-2xl border border-[var(--border)] text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-teal-600 dark:text-[#00D2C4] mx-auto mb-2" />
          <span className="text-xs text-[var(--text-secondary)] font-semibold">Loading registered fishermen...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--surface)] p-12 rounded-2xl border border-[var(--border)] text-center text-[var(--text-secondary)] text-xs">
          No fisherman accounts match your filter criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((f) => {
            const isUpdating = updatingId === f.id;
            return (
              <div
                key={f.id}
                className={`bg-[var(--surface)] p-5 rounded-2xl border shadow-xs space-y-4 transition-all ${
                  f.status === 'pending'
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : f.status === 'suspended'
                    ? 'border-rose-500/30 bg-rose-500/5'
                    : 'border-[var(--border)]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-[#00D2C4] flex items-center justify-center flex-shrink-0">
                      <Anchor className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)] text-sm">
                          {f.display_name || f.full_name}
                        </span>
                        {f.display_name && (
                          <span className="text-xs text-[var(--text-secondary)]">({f.full_name})</span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                            f.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                              : f.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                              : f.status === 'suspended'
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                              : 'bg-slate-500/10 text-[var(--text-secondary)] border-slate-500/20'
                          }`}
                        >
                          {f.status || 'approved'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-2">
                        <span>Fisherman ID: <code className="font-mono text-[var(--text-primary)]">{f.id}</code></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Registered: {new Date(f.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    {f.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(f.id, 'approved')}
                          disabled={isUpdating}
                          className="btn-aqua px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Fisherman</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(f.id, 'rejected')}
                          disabled={isUpdating}
                          className="px-3.5 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {f.status === 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(f.id, 'suspended')}
                        disabled={isUpdating}
                        className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Suspend Account</span>
                      </button>
                    )}

                    {f.status === 'suspended' && (
                      <button
                        onClick={() => handleUpdateStatus(f.id, 'approved')}
                        disabled={isUpdating}
                        className="btn-aqua px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Reactivate Account</span>
                      </button>
                    )}

                    {f.status === 'rejected' && (
                      <button
                        onClick={() => handleUpdateStatus(f.id, 'approved')}
                        disabled={isUpdating}
                        className="btn-aqua px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Reconsider & Approve</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[var(--text-secondary)] flex-shrink-0" />
                    <span className="truncate">{f.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[var(--text-secondary)] flex-shrink-0" />
                    <span>{f.phone || 'No phone provided'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-[#00D2C4] flex-shrink-0" />
                    <span className="truncate font-medium text-[var(--text-primary)]">
                      {f.dock_location || 'Harbor Dock not specified'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
