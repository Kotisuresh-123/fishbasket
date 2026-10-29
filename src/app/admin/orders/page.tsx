'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Order, OrderStatus } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import {
  Truck,
  Search,
  RefreshCw,
  Anchor,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

const ALL_STATUSES: { status: OrderStatus; label: string }[] = [
  { status: 'pending_confirmation', label: 'Pending Confirmation' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'accepted_for_prep', label: 'Accepted for Prep' },
  { status: 'preparing', label: 'Preparing Seafood' },
  { status: 'ready_for_pickup', label: 'Ready for Pickup' },
  { status: 'packed', label: 'Packed & Chilled' },
  { status: 'out_for_delivery', label: 'Out for Delivery' },
  { status: 'delivered', label: 'Delivered' },
  { status: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          requesterId: user?.id,
          requesterRole: 'admin',
          notes: `Admin oversight transition to ${newStatus}`,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? data.order : o))
        );
      } else {
        setErrorMessage(data.message || 'Status transition rejected.');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch {
      setErrorMessage('Network error while updating status.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search) ||
      o.delivery_address.city.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Order Management</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Process orders, advance preparation stages, and manage dispatch status
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-semibold rounded-xl hover:border-teal-500/40 transition-colors self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-600 dark:text-[#00D2C4]" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-medium shadow-xs">
          <strong>Action Blocked:</strong> {errorMessage}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ref, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#00D2C4]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
          <span className="text-[var(--text-secondary)] font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[var(--border)] font-semibold bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4]"
          >
            <option value="all">All Statuses ({orders.length})</option>
            {ALL_STATUSES.map((s) => (
              <option key={s.status} value={s.status}>
                {s.label} ({orders.filter((o) => o.status === s.status).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="bg-[var(--surface)] p-12 rounded-2xl border border-[var(--border)] text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-teal-600 dark:text-[#00D2C4] mx-auto mb-2" />
          <span className="text-xs text-[var(--text-secondary)] font-semibold">Loading orders pipeline...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--surface)] p-12 rounded-2xl border border-[var(--border)] text-center text-[var(--text-secondary)] text-xs">
          No orders match your active filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 shadow-xs space-y-4"
            >
              {/* Top Row: Ref, Customer, Status, Amount */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[var(--text-primary)]">
                      {order.order_number}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/10 text-teal-700 dark:text-[#00D2C4] border border-teal-500/20">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    Customer: <strong className="text-[var(--text-primary)]">{order.customer_name}</strong> ({order.customer_phone})
                  </div>
                  {order.seller_name && (
                    <div className="text-[11px] text-teal-700 dark:text-[#00D2C4] font-semibold flex items-center gap-1 mt-0.5">
                      <Anchor className="w-3 h-3" />
                      <span>Fisherman Seller: <strong>{order.seller_name}</strong></span>
                    </div>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-base font-black text-[var(--text-primary)] block">
                    {formatINR(order.total_amount)}
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    Pay: <strong className="uppercase text-[var(--text-primary)]">{order.payment_method}</strong> ({order.payment_status})
                  </span>
                </div>
              </div>

              {/* Destination & Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--text-secondary)]">
                <div>
                  <span className="text-[var(--text-secondary)] opacity-70 text-[10px] uppercase font-bold block">
                    Delivery Address
                  </span>
                  <div>{order.delivery_address.house_flat}, {order.delivery_address.street_locality}</div>
                  <div className="font-semibold text-[var(--text-primary)]">{order.delivery_address.city} - {order.delivery_address.pincode}</div>
                  {order.delivery_notes && (
                    <div className="text-[11px] text-[var(--text-secondary)] italic mt-0.5">
                      Note: &ldquo;{order.delivery_notes}&rdquo;
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[var(--text-secondary)] opacity-70 text-[10px] uppercase font-bold block">
                    Slot & Fulfillment
                  </span>
                  <div className="font-medium text-[var(--text-primary)]">{order.delivery_slot.name}</div>
                  {order.assigned_delivery_partner ? (
                    <div className="text-teal-700 dark:text-[#00D2C4] font-semibold mt-1 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Partner: {order.assigned_delivery_partner.name}</span>
                    </div>
                  ) : (
                    <div className="text-amber-600 dark:text-amber-400 text-[11px] font-medium mt-1">
                      No delivery partner assigned yet
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)] space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block mb-1">
                  Catch Items Ordered
                </span>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[var(--text-secondary)]">
                    <div>
                      <strong className="text-[var(--text-primary)]">{item.quantity}×</strong> {item.product_name}{' '}
                      <span className="text-[var(--text-secondary)] text-[11px]">
                        ({item.variant_name} • {item.preparation_name})
                      </span>
                    </div>
                    <span className="font-semibold text-[var(--text-primary)]">{formatINR(item.item_total)}</span>
                  </div>
                ))}
              </div>

              {/* Quick Status Advance Pipeline Controls */}
              <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--text-secondary)]">
                  <span>Advance Status:</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'accepted_for_prep')}
                      disabled={updatingId === order.id}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors"
                    >
                      Accept for Prep →
                    </button>
                  )}

                  {order.status === 'accepted_for_prep' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'preparing')}
                      disabled={updatingId === order.id}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition-colors"
                    >
                      Start Cutting & Prep →
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'packed')}
                      disabled={updatingId === order.id}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-colors"
                    >
                      Mark Packed & Chilled →
                    </button>
                  )}

                  {order.status === 'packed' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'out_for_delivery')}
                      disabled={updatingId === order.id}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs transition-colors"
                    >
                      Dispatch Out for Delivery →
                    </button>
                  )}

                  {order.status === 'out_for_delivery' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      disabled={updatingId === order.id}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors"
                    >
                      Confirm Delivered ✓
                    </button>
                  )}

                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                      disabled={updatingId === order.id}
                      className="px-3 py-1.5 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg font-semibold text-xs transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}

                  <Link
                    href={`/track-order/${order.id}`}
                    target="_blank"
                    className="px-3 py-1.5 border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:border-teal-500/40 rounded-lg text-xs font-semibold transition-colors"
                  >
                    View Live Tracker ↗
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
