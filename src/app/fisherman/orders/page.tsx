'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Order, OrderStatus } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import {
  ShoppingBag,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Scissors,
  ArrowRight,
  Package,
  Truck,
  Check,
  RefreshCw,
} from 'lucide-react';

type PipelineStage = 'all' | 'needs_prep' | 'preparing' | 'ready_for_pickup' | 'completed';

export default function FishermanOrderPipelinePage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState<PipelineStage>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?fishermanId=${encodeURIComponent(user.id)}`);
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleAdvanceStatus = async (orderId: string, nextStatus: OrderStatus) => {
    if (!user) return;
    setUpdatingId(orderId);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          notes: `Preparation updated to ${nextStatus.replace(/_/g, ' ')} by ${user.display_name || user.full_name}`,
          requesterId: user.id,
          requesterRole: 'fisherman',
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? data.order : ord))
        );
        setActionSuccess(
          `Order ${data.order.order_number} marked as ${nextStatus.replace(/_/g, ' ').toUpperCase()}`
        );
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        setActionError(data.message || 'Failed to update order status.');
        setTimeout(() => setActionError(null), 4000);
      }
    } catch {
      setActionError('Network error while updating preparation status.');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setUpdatingId(null);
    }
  };

  // Pipeline stage counts
  const needsPrepCount = orders.filter(
    (o) => o.status === 'confirmed' || o.status === 'accepted_for_prep' || o.status === 'pending_confirmation'
  ).length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyPickupCount = orders.filter((o) => o.status === 'ready_for_pickup').length;
  const completedCount = orders.filter(
    (o) => o.status === 'out_for_delivery' || o.status === 'delivered'
  ).length;

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((it) => it.product_name.toLowerCase().includes(search.toLowerCase()));

    let matchesStage = true;
    if (stage === 'needs_prep') {
      matchesStage =
        o.status === 'confirmed' ||
        o.status === 'accepted_for_prep' ||
        o.status === 'pending_confirmation';
    } else if (stage === 'preparing') {
      matchesStage = o.status === 'preparing';
    } else if (stage === 'ready_for_pickup') {
      matchesStage = o.status === 'ready_for_pickup';
    } else if (stage === 'completed') {
      matchesStage = o.status === 'out_for_delivery' || o.status === 'delivered';
    }

    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Order Preparation Pipeline
          </h1>
          <p className="text-xs text-slate-500">
            Fulfill preparation requests, cut & clean fresh catches, and signal readiness for cold-chain pickup
          </p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-2xs">
          <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium flex items-center gap-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Pipeline Stages Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <button
          type="button"
          onClick={() => setStage('all')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            stage === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
            All Allocated
          </span>
          <span className="text-xl font-black">{orders.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setStage('needs_prep')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            stage === 'needs_prep'
              ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
              : 'bg-white hover:bg-teal-50/50 text-teal-900 border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
            1. Needs Prep
          </span>
          <span className="text-xl font-black text-teal-600 dark:text-white">
            {needsPrepCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStage('preparing')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            stage === 'preparing'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-white hover:bg-amber-50/50 text-amber-900 border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
            2. In Preparation
          </span>
          <span className="text-xl font-black text-amber-600 dark:text-white">
            {preparingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStage('ready_for_pickup')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            stage === 'ready_for_pickup'
              ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
              : 'bg-white hover:bg-sky-50/50 text-sky-900 border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
            3. Ready for Pickup
          </span>
          <span className="text-xl font-black text-sky-600 dark:text-white">
            {readyPickupCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStage('completed')}
          className={`p-3 rounded-2xl border text-left transition-all col-span-2 sm:col-span-1 ${
            stage === 'completed'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
              : 'bg-white hover:bg-emerald-50/50 text-emerald-900 border-slate-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
            4. In Transit / Done
          </span>
          <span className="text-xl font-black text-emerald-600 dark:text-white">
            {completedCount}
          </span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by order number (e.g. FB-), customer name, or fish species..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Orders Pipeline List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading order queue...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">No orders in this pipeline stage</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {stage === 'all'
                ? 'When customers purchase catches from your boat, orders will appear here immediately.'
                : `No orders are currently waiting in the "${stage.replace(/_/g, ' ')}" phase.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((ord) => {
              const isNeedsPrep =
                ord.status === 'confirmed' ||
                ord.status === 'accepted_for_prep' ||
                ord.status === 'pending_confirmation';
              const isPreparing = ord.status === 'preparing';
              const isReadyForPickup = ord.status === 'ready_for_pickup';
              const isDispatched =
                ord.status === 'out_for_delivery' || ord.status === 'delivered';

              return (
                <div
                  key={ord.id}
                  className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Left Column: Order metadata & Items */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono font-black text-sm text-slate-900">
                        {ord.order_number}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'out_for_delivery'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === 'ready_for_pickup'
                            ? 'bg-sky-100 text-sky-800'
                            : ord.status === 'preparing'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Placed: {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Slot: {ord.delivery_slot?.name}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      Customer: <strong className="text-slate-800">{ord.customer_name}</strong> •{' '}
                      <span>{ord.delivery_address.city} (PIN: {ord.delivery_address.pincode})</span>
                    </div>

                    {/* Preparation & Cutting Requirements */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Scissors className="w-3 h-3 text-teal-600" />
                        <span>Catch Preparation & Cutting Specifications:</span>
                      </div>
                      <div className="space-y-1.5">
                        {ord.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1"
                          >
                            <span className="font-semibold text-slate-800">
                              {it.quantity}x {it.product_name}{' '}
                              {it.variant_name && (
                                <span className="text-slate-500 font-normal">({it.variant_name})</span>
                              )}
                            </span>
                            {it.preparation_name ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-900 border border-teal-200 text-[11px] font-bold self-start sm:self-auto">
                                <Scissors className="w-3 h-3" />
                                Requested Cut: {it.preparation_name}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">Whole / Standard Clean</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {ord.delivery_notes && (
                      <p className="text-[11px] text-slate-500 italic">
                        Notes: &ldquo;{ord.delivery_notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Right Column: Workflow Actions */}
                  <div className="flex sm:flex-col items-stretch sm:items-end justify-between gap-3 flex-shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 min-w-[220px]">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Order Total (COD)
                      </span>
                      <span className="text-lg font-black text-slate-900">
                        {formatINR(ord.total_amount)}
                      </span>
                    </div>

                    {/* Primary Role Transition Actions */}
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      {isNeedsPrep && (
                        <button
                          type="button"
                          disabled={updatingId === ord.id}
                          onClick={() => handleAdvanceStatus(ord.id, 'preparing')}
                          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                          <span>
                            {updatingId === ord.id ? 'Updating...' : 'Start Preparation'}
                          </span>
                        </button>
                      )}

                      {isPreparing && (
                        <button
                          type="button"
                          disabled={updatingId === ord.id}
                          onClick={() => handleAdvanceStatus(ord.id, 'ready_for_pickup')}
                          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>
                            {updatingId === ord.id ? 'Updating...' : 'Mark Ready for Pickup'}
                          </span>
                        </button>
                      )}

                      {isReadyForPickup && (
                        <div className="px-3.5 py-2 bg-sky-50 text-sky-800 border border-sky-200 rounded-xl text-center text-[11px] font-bold flex items-center justify-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 animate-pulse text-sky-600" />
                          <span>Awaiting Fleet Pickup</span>
                        </div>
                      )}

                      {isDispatched && (
                        <div className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-center text-[11px] font-bold flex items-center justify-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-slate-500" />
                          <span>Handed to Cold Fleet</span>
                        </div>
                      )}

                      <Link
                        href={`/fisherman/orders/${ord.id}`}
                        className="px-3 py-1.5 text-center text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        View Full Details →
                      </Link>
                    </div>
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
