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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Fisherman Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Approve applicant fishermen, verify harbor dock landing centers, and manage selling privileges
          </p>
        </div>

        <button
          onClick={fetchFishermen}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
          <span>Refresh Fishermen</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Metric Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { key: 'all', label: 'All Registered', count: counts.all, color: 'text-slate-900' },
          { key: 'pending', label: 'Pending Approval', count: counts.pending, color: 'text-amber-600' },
          { key: 'approved', label: 'Active Approved', count: counts.approved, color: 'text-emerald-600' },
          { key: 'suspended', label: 'Suspended', count: counts.suspended, color: 'text-rose-600' },
          { key: 'rejected', label: 'Rejected', count: counts.rejected, color: 'text-slate-500' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`p-3 rounded-2xl border text-left transition-all ${
              statusFilter === tab.key
                ? 'bg-white border-teal-500 shadow-xs ring-2 ring-teal-500/10'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className={`text-xl font-black ${tab.color}`}>{tab.count}</div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search fisherman name, boat, dock, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 font-semibold bg-white text-slate-800 focus:outline-none focus:border-teal-500"
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
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
          <span className="text-xs text-slate-500 font-semibold">Loading registered fishermen...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          No fisherman accounts match your filter criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((f) => {
            const isUpdating = updatingId === f.id;
            return (
              <div
                key={f.id}
                className={`bg-white p-5 rounded-2xl border shadow-xs space-y-4 transition-all ${
                  f.status === 'pending'
                    ? 'border-amber-200 bg-amber-50/20'
                    : f.status === 'suspended'
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center flex-shrink-0">
                      <Anchor className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {f.display_name || f.full_name}
                        </span>
                        {f.display_name && (
                          <span className="text-xs text-slate-400">({f.full_name})</span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            f.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : f.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : f.status === 'suspended'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {f.status || 'approved'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Fisherman ID: <code className="font-mono text-slate-600">{f.id}</code></span>
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
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Fisherman</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(f.id, 'rejected')}
                          disabled={isUpdating}
                          className="px-3.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
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
                        className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Suspend Account</span>
                      </button>
                    )}

                    {f.status === 'suspended' && (
                      <button
                        onClick={() => handleUpdateStatus(f.id, 'approved')}
                        disabled={isUpdating}
                        className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Reactivate Account</span>
                      </button>
                    )}

                    {f.status === 'rejected' && (
                      <button
                        onClick={() => handleUpdateStatus(f.id, 'approved')}
                        disabled={isUpdating}
                        className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Reconsider & Approve</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{f.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{f.phone || 'No phone provided'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span className="truncate font-medium text-slate-800">
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
