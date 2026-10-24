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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Delivery Fleet Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin oversight, KYC verification, vehicle approval & active route dispatch status
          </p>
        </div>

        <button
          onClick={fetchPartners}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Fleet
          </span>
          <div className="text-2xl font-black text-slate-900">{counts.all}</div>
          <span className="text-xs text-slate-500 mt-1 block">Registered drivers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
            Pending Approval
          </span>
          <div className="text-2xl font-black text-amber-700">{counts.pending}</div>
          <span className="text-xs text-amber-600 mt-1 block">Needs verification</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Active / Approved
          </span>
          <div className="text-2xl font-black text-emerald-600">{counts.approved}</div>
          <span className="text-xs text-slate-500 mt-1 block">Can accept dispatches</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Suspended / Inactive
          </span>
          <div className="text-2xl font-black text-red-600">{counts.suspended + counts.rejected}</div>
          <span className="text-xs text-slate-500 mt-1 block">Access blocked</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'pending', 'approved', 'suspended', 'rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'All Fleet' : st} ({counts[st] || 0})
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver, phone, vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Fleet Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Driver Profile</th>
                <th className="pb-3">Contact Details</th>
                <th className="pb-3">Vehicle & Cold-Chain Info</th>
                <th className="pb-3">Joined Date</th>
                <th className="pb-3">Approval Status</th>
                <th className="pb-3 pr-2 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading delivery partner fleet...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No delivery partners matching filter.
                  </td>
                </tr>
              ) : (
                filtered.map((partner) => {
                  const isUpdating = updatingId === partner.id;

                  return (
                    <tr key={partner.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Driver Profile */}
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs shrink-0">
                            {partner.full_name?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{partner.full_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {partner.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="py-3.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{partner.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{partner.phone || 'No phone recorded'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Vehicle Info */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Navigation className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{partner.vehicle_info || 'Cold-Chain Insulated Van'}</span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 text-slate-500 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
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
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved</span>
                          </span>
                        ) : partner.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Pending Review</span>
                          </span>
                        ) : partner.status === 'suspended' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <Lock className="w-3 h-3" />
                            <span>Suspended</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            <XCircle className="w-3 h-3" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-2 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {partner.status !== 'approved' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(partner.id, 'approved')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[11px] rounded-lg transition-colors shadow-2xs"
                              title="Approve driver to accept dispatches"
                            >
                              Approve
                            </button>
                          )}

                          {partner.status === 'pending' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(partner.id, 'rejected')}
                              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-700 font-bold text-[11px] rounded-lg transition-colors"
                              title="Reject registration application"
                            >
                              Reject
                            </button>
                          )}

                          {partner.status === 'approved' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(partner.id, 'suspended')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 disabled:opacity-50 font-bold text-[11px] rounded-lg transition-colors"
                              title="Temporarily suspend fleet driver access"
                            >
                              Suspend
                            </button>
                          )}

                          {partner.status === 'suspended' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(partner.id, 'approved')}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 font-bold text-[11px] rounded-lg transition-colors"
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
