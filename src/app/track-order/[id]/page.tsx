'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Order, OrderStatus } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Phone,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

import { supabase } from '@/lib/supabaseClient';

interface TrackOrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

const ORDER_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'confirmed', label: 'Order Confirmed', desc: 'Received & sent to harbor facility' },
  { status: 'accepted_for_prep', label: 'Accepted for Prep', desc: 'Assigned to expert fishmonger' },
  { status: 'preparing', label: 'Preparing & Cutting', desc: 'Descaling, cleaning & custom cut' },
  { status: 'ready_for_pickup', label: 'Ready for Pickup', desc: 'Chilled & packed for delivery fleet' },
  { status: 'out_for_delivery', label: 'Out for Delivery', desc: 'On its way to your doorstep' },
  { status: 'delivered', label: 'Delivered Fresh', desc: 'Handed over at your address' },
];

export default function TrackOrderPage({ params }: TrackOrderPageProps) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Supabase Realtime live sync
    const channel = supabase
      .channel(`order-track-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrder();
        }
      )
      .subscribe();

    // Auto refresh interval fallback
    const interval = setInterval(fetchOrder, 8000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-[#00D2C4] mx-auto mb-3" />
        <p className="text-[#52667A] dark:text-[#9DB0C0] font-semibold text-sm">Fetching live order status...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-[#112233] dark:text-[#EAF2F8]">Order Not Found</h2>
        <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] mt-1">We couldn&apos;t find order with reference &ldquo;{id}&rdquo;.</p>
        <Link href="/account/orders" className="mt-4 inline-block px-4 py-2 btn-aqua rounded-xl text-xs font-bold">
          View My Orders
        </Link>
      </div>
    );
  }

  const effectiveStatus = order.status === 'packed' ? 'ready_for_pickup' : order.status;
  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.status === effectiveStatus);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#17232E] p-6 rounded-3xl border border-[#DCE5EA] dark:border-[#243444] shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#112233] dark:text-[#EAF2F8] tracking-tight">
              Order {order.order_number}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#00D2C4]/15 text-[#009E93] dark:text-[#00D2C4] border border-[#00D2C4]/30">
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] mt-1">
            Placed on {new Date(order.created_at).toLocaleString()} • Slot: <strong className="text-[#112233] dark:text-[#EAF2F8]">{order.delivery_slot.name}</strong>
          </p>
        </div>

        <button
          onClick={() => {
            setIsRefreshing(true);
            fetchOrder();
          }}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#EDF3F5] dark:bg-[#121C25] hover:bg-slate-200 dark:hover:bg-[#1F2E3D] text-[#112233] dark:text-[#EAF2F8] font-semibold text-xs rounded-xl transition-colors self-start sm:self-auto cursor-pointer border border-[#DCE5EA] dark:border-[#243444]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00D2C4]' : 'text-[#00D2C4]'}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Cancelled Alert if applicable */}
      {isCancelled ? (
        <div className="bg-rose-500/15 border border-rose-500/30 p-6 rounded-3xl text-rose-800 dark:text-rose-300 space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span>Order Cancelled</span>
          </div>
          <p className="text-xs text-rose-700 dark:text-rose-300">
            {order.cancelled_reason || 'This order was cancelled. Any online payment has been initiated for refund.'}
          </p>
        </div>
      ) : (
        /* Status Stepper Timeline */
        <div className="bg-white dark:bg-[#17232E] p-6 sm:p-8 rounded-3xl border border-[#DCE5EA] dark:border-[#243444] shadow-xs space-y-6 transition-colors">
          <h2 className="text-base font-bold text-[#112233] dark:text-[#EAF2F8]">Live Seafood Processing Pipeline</h2>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden sm:block absolute top-5 left-6 right-6 h-0.5 bg-[#DCE5EA] dark:bg-[#243444] -z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-6 gap-6 relative z-10">
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step.status} className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-3 sm:gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors flex-shrink-0 ${
                        isPassed
                          ? 'bg-[#00D2C4] text-[#112233] shadow-md'
                          : 'bg-[#EDF3F5] dark:bg-[#121C25] text-[#7E92A2] dark:text-[#6B7F91] border border-[#DCE5EA] dark:border-[#243444]'
                      } ${isCurrent ? 'ring-4 ring-[#00D2C4]/25' : ''}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5 text-[#112233]" /> : idx + 1}
                    </div>

                    <div>
                      <div className={`text-xs font-bold ${isCurrent ? 'text-[#009E93] dark:text-[#00D2C4]' : isPassed ? 'text-[#112233] dark:text-[#EAF2F8]' : 'text-[#7E92A2] dark:text-[#6B7F91]'}`}>
                        {step.label}
                      </div>
                      <div className="text-[10px] text-[#7E92A2] dark:text-[#6B7F91] leading-tight hidden sm:block mt-0.5">
                        {step.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Delivery Partner Info (if assigned) */}
      {order.assigned_delivery_partner && (
        <div className="bg-white dark:bg-[#17232E] p-6 rounded-3xl border border-[#DCE5EA] dark:border-[#243444] shadow-xs flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                Assigned Delivery Partner
              </span>
              <h4 className="font-bold text-sm text-[#112233] dark:text-[#EAF2F8]">
                {order.assigned_delivery_partner.name}
              </h4>
              <p className="text-xs text-[#52667A] dark:text-[#9DB0C0]">
                Cold-Chain Vehicle • Certified temperature handler
              </p>
            </div>
          </div>

          <a
            href={`tel:${order.assigned_delivery_partner.phone}`}
            className="px-4 py-2 bg-[#EDF3F5] dark:bg-[#121C25] hover:bg-slate-200 dark:hover:bg-[#1F2E3D] text-[#112233] dark:text-[#EAF2F8] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-[#DCE5EA] dark:border-[#243444]"
          >
            <Phone className="w-3.5 h-3.5 text-[#00D2C4]" />
            <span>Call Partner</span>
          </a>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Address Card */}
        <div className="bg-white dark:bg-[#17232E] p-6 rounded-3xl border border-[#DCE5EA] dark:border-[#243444] space-y-2 transition-colors">
          <div className="flex items-center gap-1.5 font-bold text-[#112233] dark:text-[#EAF2F8] text-sm mb-2">
            <MapPin className="w-4 h-4 text-[#00D2C4]" />
            <span>Destination Address</span>
          </div>
          <div className="font-bold text-[#112233] dark:text-[#EAF2F8]">{order.delivery_address.recipient_name}</div>
          <div className="text-[#52667A] dark:text-[#9DB0C0]">{order.delivery_address.house_flat}, {order.delivery_address.street_locality}</div>
          {order.delivery_address.landmark && (
            <div className="text-[#7E92A2] dark:text-[#6B7F91]">Near: {order.delivery_address.landmark}</div>
          )}
          <div className="text-[#112233] dark:text-[#EAF2F8] font-semibold">{order.delivery_address.city} - {order.delivery_address.pincode}</div>
          {order.delivery_notes && (
            <div className="p-2.5 bg-[#EDF3F5] dark:bg-[#121C25] rounded-xl text-[#52667A] dark:text-[#9DB0C0] mt-2 text-[11px] border border-[#DCE5EA] dark:border-[#243444]">
              Notes: &ldquo;{order.delivery_notes}&rdquo;
            </div>
          )}
        </div>

        {/* Catch summary */}
        <div className="bg-white dark:bg-[#17232E] p-6 rounded-3xl border border-[#DCE5EA] dark:border-[#243444] space-y-3 transition-colors">
          <div className="flex items-center gap-1.5 font-bold text-[#112233] dark:text-[#EAF2F8] text-sm">
            <Package className="w-4 h-4 text-[#00D2C4]" />
            <span>Catch Summary ({order.items.length} items)</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-[#DCE5EA] dark:divide-[#243444]">
            {order.items.map((item, idx) => (
              <div key={idx} className="pt-2 first:pt-0 flex justify-between">
                <div>
                  <div className="font-semibold text-[#112233] dark:text-[#EAF2F8]">{item.product_name}</div>
                  <div className="text-[11px] text-[#7E92A2] dark:text-[#6B7F91]">
                    {item.variant_name} • {item.preparation_name} (Qty: {item.quantity})
                  </div>
                </div>
                <div className="font-bold text-[#112233] dark:text-[#EAF2F8]">{formatINR(item.item_total)}</div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#DCE5EA] dark:border-[#243444] flex justify-between text-sm font-black text-[#112233] dark:text-[#EAF2F8]">
            <span>Total Paid</span>
            <span className="text-[#009E93] dark:text-[#00D2C4]">{formatINR(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
