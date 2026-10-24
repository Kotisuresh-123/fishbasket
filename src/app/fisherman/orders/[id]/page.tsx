'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Order, OrderStatus } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Scissors,
  Truck,
  MapPin,
  AlertCircle,
  Package,
  Check,
} from 'lucide-react';

export default function FishermanOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [prepNotes, setPrepNotes] = useState('');

  useEffect(() => {
    async function loadOrder() {
      if (!orderId || !user) return;
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        const data = await res.json();
        if (!data.success || !data.order) {
          setErrorMsg('Order not found.');
          setLoading(false);
          return;
        }

        const o = data.order;
        // Ownership check:
        const userAppId = user.id;
        const matchesSeller =
          o.fisherman_id === userAppId ||
          o.items?.some((it: any) => it.fisherman_id === userAppId) ||
          user.role === 'admin';

        if (!matchesSeller) {
          setErrorMsg('Unauthorized: You can only view orders containing catches from your boat.');
          setLoading(false);
          return;
        }

        setOrder(o);
      } catch {
        setErrorMsg('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId, user]);

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order || !user) return;
    setIsUpdating(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: prepNotes || `Status updated to ${newStatus.replace(/_/g, ' ')} by ${user.display_name || user.full_name}`,
          requesterId: user.id,
          requesterRole: 'fisherman',
        }),
      });
      const data = await res.json();
      setIsUpdating(false);

      if (data.success && data.order) {
        setOrder(data.order);
        setSuccessMsg(`Order updated to: ${newStatus.replace(/_/g, ' ').toUpperCase()}`);
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(data.message || 'Error updating order status.');
      }
    } catch {
      setIsUpdating(false);
      setErrorMsg('Network error while updating status.');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading order details...</div>;
  }

  if (errorMsg && !order) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-rose-200 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="font-bold text-sm text-slate-900">{errorMsg}</h2>
        <Link href="/fisherman/orders" className="text-xs font-bold text-teal-700 underline block">
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/fisherman/orders"
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-1 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Order Pipeline
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {order.order_number}
            </h1>
            <p className="text-xs text-slate-500">
              Placed on {new Date(order.created_at).toLocaleString()} • Fisherman: {order.seller_name}
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider self-start sm:self-auto ${
              order.status === 'delivered'
                ? 'bg-emerald-100 text-emerald-800'
                : order.status === 'ready_for_pickup'
                ? 'bg-sky-100 text-sky-800'
                : order.status === 'preparing'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-teal-100 text-teal-800'
            }`}
          >
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Preparation Status Action Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Fisherman Order Preparation Controls
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {(order.status === 'confirmed' || order.status === 'pending_confirmation' || order.status === 'accepted_for_prep') && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleUpdateStatus('preparing')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Scissors className="w-4 h-4" />
              <span>{isUpdating ? 'Updating...' : 'Start Preparing Catch'}</span>
            </button>
          )}

          {order.status === 'preparing' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleUpdateStatus('ready_for_pickup')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Package className="w-4 h-4" />
              <span>{isUpdating ? 'Updating...' : 'Mark Ready for Fleet Pickup'}</span>
            </button>
          )}

          {order.status === 'ready_for_pickup' && (
            <div className="px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-2">
              <Clock className="w-4 h-4 animate-pulse text-sky-600" />
              <span>Ready for Fleet Pickup — Awaiting Cold-Chain Dispatch Driver</span>
            </div>
          )}

          {(order.status === 'out_for_delivery' || order.status === 'delivered') && (
            <div className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Transferred to Delivery Fleet: {order.status.replace(/_/g, ' ').toUpperCase()}</span>
            </div>
          )}
        </div>

        <div className="pt-2">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Add Preparation / Packing Notes (Optional)
          </label>
          <input
            type="text"
            value={prepNotes}
            onChange={(e) => setPrepNotes(e.target.value)}
            placeholder="e.g. Cut into 8 large curry pieces, descaled thoroughly, packed with sub-zero ice pack."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-medium"
          />
        </div>
      </div>

      {/* Items & Cutting Requirements */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Ordered Catch Items & Kitchen Instructions
        </h2>

        <div className="space-y-3 divide-y divide-slate-100">
          {order.items.map((it, idx) => (
            <div key={idx} className="pt-3 first:pt-0 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900">
                  {it.quantity}x {it.product_name}
                </h3>
                {it.variant_name && (
                  <div className="text-xs text-slate-500">
                    Variant Weight: <strong className="text-slate-800">{it.variant_name}</strong>
                  </div>
                )}
                {it.preparation_name && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-900 rounded-lg text-xs font-semibold mt-1">
                    <Scissors className="w-3.5 h-3.5 text-teal-700" />
                    <span>Requested Preparation: <strong>{it.preparation_name}</strong></span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className="font-bold text-xs text-slate-900 block">
                  {formatINR(it.item_total)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {formatINR(it.unit_price)} / unit
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fulfillment Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs">
          <h3 className="font-bold text-slate-900">Customer & Delivery Slot</h3>
          <p className="text-slate-600">Customer: <strong>{order.customer_name}</strong></p>
          <p className="text-slate-600">City / Area: <strong>{order.delivery_address.city} ({order.delivery_address.pincode})</strong></p>
          <p className="text-slate-600">Delivery Slot: <strong>{order.delivery_slot?.name}</strong></p>
          {order.delivery_notes && (
            <p className="text-slate-500 italic pt-1">&ldquo;{order.delivery_notes}&rdquo;</p>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs">
          <h3 className="font-bold text-slate-900">Payment & Collection Policy</h3>
          <p className="text-slate-600">Payment Mode: <strong className="uppercase">{order.payment_method}</strong></p>
          <p className="text-slate-600">Collection Status: <strong className="uppercase">{order.payment_status}</strong></p>
          <p className="text-slate-400 text-[11px] pt-1 leading-relaxed">
            Note: Cash on Delivery is collected by the authorized delivery driver upon customer doorstep inspection.
          </p>
        </div>
      </div>
    </div>
  );
}
