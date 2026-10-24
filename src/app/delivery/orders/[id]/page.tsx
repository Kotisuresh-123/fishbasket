'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import { useAuth } from '@/context/AuthContext';
import {
  Truck,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Navigation,
  Anchor,
  IndianRupee,
  ShieldCheck,
} from 'lucide-react';

interface DeliveryOrderDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

export default function DeliveryOrderDetailsPage({ params }: DeliveryOrderDetailsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [codFeedback, setCodFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrder(data.order);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (status: OrderStatus, reason?: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          notes: reason,
          requesterId: user?.id,
          requesterRole: user?.role,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch {
      // Ignore
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCollectCod = async () => {
    setIsUpdating(true);
    setCodFeedback(null);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'collect_cod',
          collectedByUserId: user?.id || 'u3',
          notes: `Cash of ${order ? formatINR(order.total_amount) : ''} received in hand by delivery rider.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setCodFeedback('Cash on Delivery successfully recorded as collected.');
      } else {
        setCodFeedback(data.message || 'Failed to record COD collection.');
      }
    } catch {
      setCodFeedback('Network error recording payment.');
    } finally {
      setIsUpdating(false);
      setTimeout(() => setCodFeedback(null), 5000);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500 text-xs">Loading delivery details...</div>;
  }

  if (!order) {
    return <div className="text-center py-20 text-slate-500 text-xs">Delivery assignment not found.</div>;
  }

  const mapsQuery = encodeURIComponent(
    `${order.delivery_address.house_flat}, ${order.delivery_address.street_locality}, ${order.delivery_address.city} ${order.delivery_address.pincode}`
  );
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/delivery"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Delivery Queue
        </Link>
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800">
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-black text-slate-900">Delivery Assignment</h1>
            <span className="font-mono text-xs font-bold text-slate-500">{order.order_number}</span>
          </div>
          <div className="text-right">
            <div className="text-base font-black text-slate-900">
              Collect: {formatINR(order.total_amount)}
            </div>
            <div className="text-[11px] font-semibold text-slate-500">
              Payment: <strong className="uppercase">{order.payment_method}</strong> •{' '}
              <span
                className={`font-bold ${
                  order.payment_status === 'success' ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {order.payment_status === 'success' ? 'PAID / COLLECTED' : 'PENDING CASH COLLECTION'}
              </span>
            </div>
          </div>
        </div>

        {/* Fisherman Harbor Pickup Information */}
        {order.seller_name && (
          <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-100 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-teal-900 text-xs">
              <Anchor className="w-4 h-4 text-teal-700" />
              <span>Fisherman Harbor Pickup</span>
            </div>
            <div className="text-slate-700">
              Fresh catch prepared and packed by: <strong className="text-slate-900">{order.seller_name}</strong>
            </div>
            <div className="text-[11px] text-teal-800 font-medium">
              Handover Status: Ready for refrigerated courier dispatch
            </div>
          </div>
        )}

        {/* Customer & Address */}
        <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Customer Destination
          </span>
          <div className="font-bold text-slate-900 text-sm">{order.customer_name}</div>
          <div className="text-slate-600">{order.delivery_address.house_flat}, {order.delivery_address.street_locality}</div>
          {order.delivery_address.landmark && (
            <div className="text-slate-500">Landmark: {order.delivery_address.landmark}</div>
          )}
          <div className="text-slate-800 font-semibold">{order.delivery_address.city} - {order.delivery_address.pincode}</div>
          {order.delivery_notes && (
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-900 font-medium mt-2">
              Customer Note: &ldquo;{order.delivery_notes}&rdquo;
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <a
              href={`tel:${order.customer_phone}`}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>Call ({order.customer_phone})</span>
            </a>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions ↗</span>
            </a>
          </div>
        </div>

        {/* COD Collection Section */}
        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-amber-700" />
              <span className="font-bold text-slate-900 text-xs">
                Cash on Delivery (COD) Collection
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                order.payment_status === 'success'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {order.payment_status === 'success' ? 'Collected ✓' : 'Cash Due at Doorstep'}
            </span>
          </div>

          <p className="text-slate-600 text-[11px]">
            Please collect exact amount of <strong className="text-slate-900">{formatINR(order.total_amount)}</strong> in cash from the customer upon handover of chilled seafood packages.
          </p>

          {codFeedback && (
            <div className="p-2.5 bg-emerald-100/80 text-emerald-900 rounded-xl font-semibold text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              <span>{codFeedback}</span>
            </div>
          )}

          {order.payment_status !== 'success' ? (
            <button
              onClick={handleCollectCod}
              disabled={isUpdating}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Cash Collected ({formatINR(order.total_amount)})</span>
            </button>
          ) : (
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>
                Payment recorded as collected by rider at{' '}
                {order.payment_collected_at
                  ? new Date(order.payment_collected_at).toLocaleTimeString()
                  : 'doorstep'}
                .
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Update Dispatch Status
          </span>

          <div className="flex flex-wrap gap-2">
            {order.status !== 'out_for_delivery' && order.status !== 'delivered' && (
              <button
                onClick={() => handleUpdate('out_for_delivery')}
                disabled={isUpdating}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
              >
                Start Delivery (Out for Delivery) →
              </button>
            )}

            {order.status !== 'delivered' && (
              <button
                onClick={() => handleUpdate('delivered')}
                disabled={isUpdating}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
              >
                Mark Successfully Handed Over (Delivered) ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
