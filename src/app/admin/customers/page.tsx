'use client';

import React, { useEffect, useState } from 'react';
import { CustomerSummary } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import {
  Users,
  Mail,
  Phone,
  ShoppingBag,
  Search,
  RefreshCw,
  Calendar,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCustomers = async (query = '') => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const url = query ? `/api/admin/customers?q=${encodeURIComponent(query)}` : '/api/admin/customers';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
      } else {
        setErrorMsg(data.message || 'Failed to retrieve customers.');
      }
    } catch {
      setErrorMsg('Network error connecting to customer database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(search);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  const totalRegistered = customers.length;
  const activeBuyers = customers.filter((c) => c.order_count > 0).length;
  const newMembersWithoutOrders = customers.filter((c) => c.order_count === 0).length;
  const totalLifetimeSpend = customers.reduce((sum, c) => sum + c.total_spend, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
            Customer Directory & Management
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Registered customer accounts, complete order frequencies, and lifetime purchases
          </p>
        </div>

        <button
          onClick={() => fetchCustomers(search)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-semibold rounded-xl hover:bg-[var(--surface-elevated)] transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#00D2C4] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Registered Customers</span>
            <Users className="w-4 h-4 text-[#00D2C4]" />
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)] mt-1">{totalRegistered}</div>
          <span className="text-[10px] text-[var(--text-secondary)]">Total verified accounts</span>
        </div>

        <div className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Active Buyers</span>
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-500 mt-1">{activeBuyers}</div>
          <span className="text-[10px] text-[var(--text-secondary)]">Placed 1+ orders</span>
        </div>

        <div className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">New / Browsing</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500 mt-1">{newMembersWithoutOrders}</div>
          <span className="text-[10px] text-[var(--text-secondary)]">0 orders placed yet</span>
        </div>

        <div className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">Total Customer Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-[#00D2C4]" />
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)] mt-1">
            {formatINR(totalLifetimeSpend)}
          </div>
          <span className="text-[10px] text-[var(--text-secondary)]">Lifetime purchases</span>
        </div>
      </div>

      {/* Search and Filters */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between"
      >
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="submit"
            className="px-4 py-2 btn-aqua rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                fetchCustomers('');
              }}
              className="px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/20 text-rose-500 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--text-secondary)] flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#00D2C4]" />
            <span>Loading registered customer directory...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-secondary)] space-y-2">
            <Users className="w-10 h-10 mx-auto text-[var(--text-secondary)] opacity-40" />
            <p className="font-bold text-[var(--text-primary)] text-sm">No registered customers found</p>
            <p className="text-xs text-[var(--text-secondary)]">
              {search ? 'Try adjusting your search terms.' : 'No customer accounts registered in the database.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-elevated)] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[10px] border-b border-[var(--border)]">
                <tr>
                  <th className="p-4">Customer Name & ID</th>
                  <th className="p-4">Contact Information</th>
                  <th className="p-4">Registration Date</th>
                  <th className="p-4">Orders Placed</th>
                  <th className="p-4">Lifetime Spend</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Purchase History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[var(--surface-elevated)] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1.5">
                        <span>{c.full_name}</span>
                        {c.email === 'customer@fishbasket.in' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border)]">
                            Preserved Sample Account
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] font-mono">ID: {c.id}</div>
                    </td>
                    <td className="p-4 space-y-0.5">
                      <div className="text-[var(--text-primary)] font-medium flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-[var(--text-secondary)] flex-shrink-0" />
                        <span>{c.email}</span>
                      </div>
                      <div className="text-[var(--text-secondary)] flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-[var(--text-secondary)] flex-shrink-0" />
                        <span>{c.phone || 'Not provided'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[var(--text-secondary)]" />
                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                          c.order_count > 0
                            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                            : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border)]'
                        }`}
                      >
                        {c.order_count} {c.order_count === 1 ? 'order' : 'orders'}
                      </span>
                    </td>
                    <td className="p-4 font-black text-[var(--text-primary)]">
                      {formatINR(c.total_spend)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          c.order_count > 0
                            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                            : 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        {c.order_count > 0 ? 'Active Buyer' : 'New Member'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {c.order_count > 0 ? (
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--surface-elevated)] hover:bg-[#00D2C4]/15 text-[var(--text-primary)] hover:text-[#00D2C4] font-bold text-[11px] rounded-lg transition-colors border border-[var(--border)] cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-[#00D2C4]" />
                          <span>View History ({c.order_count})</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-[var(--text-secondary)] italic">No orders placed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Purchase History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[var(--surface)] rounded-3xl max-w-2xl w-full border border-[var(--border)] shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-elevated)]">
              <div>
                <h3 className="font-black text-[var(--text-primary)] text-base">
                  Purchase History: {selectedCustomer.full_name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {selectedCustomer.email} • {selectedCustomer.phone || 'No phone'} • Member since{' '}
                  {new Date(selectedCustomer.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-full hover:bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs p-3 bg-[#00D2C4]/10 rounded-xl border border-[#00D2C4]/20">
                <span className="font-semibold text-[var(--text-primary)]">
                  Total Orders: <strong>{selectedCustomer.order_count}</strong>
                </span>
                <span className="font-black text-[#00D2C4]">
                  Lifetime Spend: {formatINR(selectedCustomer.total_spend)}
                </span>
              </div>

              <div className="space-y-3">
                {selectedCustomer.orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[#00D2C4]/50 transition-all space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[var(--text-primary)]">{ord.order_number}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                              : ord.status === 'out_for_delivery'
                              ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                              : 'bg-[#00D2C4]/15 text-[#00D2C4] border border-[#00D2C4]/20'
                          }`}
                        >
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="font-black text-[var(--text-primary)]">{formatINR(ord.total_amount)}</span>
                    </div>

                    <div className="text-[var(--text-secondary)] text-[11px]">
                      Items: <strong className="text-[var(--text-primary)]">{ord.items_summary}</strong>
                    </div>

                    <div className="text-[10px] text-[var(--text-secondary)] flex items-center justify-between pt-1 border-t border-[var(--border)]">
                      <span>Placed on: {new Date(ord.created_at).toLocaleString()}</span>
                      <span className="font-mono">ID: {ord.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-elevated)] flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-[var(--surface)] hover:bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
