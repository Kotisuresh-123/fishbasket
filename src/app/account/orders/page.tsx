'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import { Package, Truck, RefreshCw, AlertCircle } from 'lucide-react';

export default function CustomerOrdersPage() {
  const { user, isLoaded } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      setLoading(false);
      router.push('/login?redirect=/account/orders');
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/orders?userId=${encodeURIComponent(user.id)}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.push('/login?redirect=/account/orders');
          return;
        }
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || data.error || 'Failed to load orders');
        }
        setOrders(data.orders || []);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      })
      .finally(() => setLoading(false));
  }, [user?.id, isLoaded, router]);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return o.status !== 'delivered' && o.status !== 'cancelled';
    if (filter === 'delivered') return o.status === 'delivered';
    return true;
  });

  if (loading) {
    return (
      <div className="bg-[var(--surface)] p-12 rounded-2xl border border-[var(--border)] text-center">
        <RefreshCw className="w-6 h-6 animate-spin text-teal-600 dark:text-[#00D2C4] mx-auto mb-2" />
        <span className="text-xs text-[var(--text-secondary)] font-semibold">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--surface)] p-8 rounded-2xl border border-red-500/20 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h3 className="font-bold text-[var(--text-primary)] text-sm">Unable to load orders</h3>
        <p className="text-xs text-[var(--text-secondary)]">{error}</p>
        <button
          onClick={() => {
            if (user) {
              setLoading(true);
              setError(null);
              fetch(`/api/orders?userId=${encodeURIComponent(user.id)}`)
                .then(async (res) => {
                  const data = await res.json();
                  if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Failed to load orders');
                  setOrders(data.orders || []);
                })
                .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch orders'))
                .finally(() => setLoading(false));
            }
          }}
          className="px-4 py-2 btn-aqua font-bold text-xs rounded-xl shadow-xs"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">My Order History</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Track active deliveries and review previous seafood catches
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-200/50 dark:bg-slate-800/60 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-[var(--surface)] text-teal-700 dark:text-[#00D2C4] shadow-xs font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'active'
                ? 'bg-[var(--surface)] text-teal-700 dark:text-[#00D2C4] shadow-xs font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Active ({orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length})
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'delivered'
                ? 'bg-[var(--surface)] text-teal-700 dark:text-[#00D2C4] shadow-xs font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Delivered ({orders.filter((o) => o.status === 'delivered').length})
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-[var(--surface)] p-12 rounded-2xl border border-[var(--border)] text-center space-y-3">
          <Package className="w-10 h-10 text-[var(--text-secondary)] opacity-50 mx-auto" />
          <h3 className="font-bold text-[var(--text-primary)] text-base">No orders found</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            You don&apos;t have any orders matching this filter.
          </p>
          <Link
            href="/shop"
            className="inline-block mt-2 px-4 py-2.5 btn-aqua font-bold text-xs rounded-xl shadow-xs"
          >
            Order Today&apos;s Catch
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 shadow-xs space-y-4"
            >
              {/* Order Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                    {order.order_number}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">•</span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-700 dark:text-[#00D2C4] border border-teal-500/20">
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-black text-[var(--text-primary)]">
                    {formatINR(order.total_amount)}
                  </span>
                </div>
              </div>

              {/* Items List Snapshot */}
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-[var(--text-secondary)] font-bold">{item.quantity}×</span>
                      <span className="font-semibold text-[var(--text-primary)]">{item.product_name}</span>
                      <span className="text-[11px] text-[var(--text-secondary)] hidden sm:inline">
                        ({item.variant_name} • {item.preparation_name})
                      </span>
                    </div>
                    <span className="font-bold text-[var(--text-primary)]">{formatINR(item.item_total)}</span>
                  </div>
                ))}
              </div>

              {/* Footer actions */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <div className="text-[11px] text-[var(--text-secondary)]">
                  Slot: <strong className="text-[var(--text-primary)]">{order.delivery_slot.name}</strong>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Details & Invoice
                  </Link>

                  <Link
                    href={`/track-order/${order.id}`}
                    className="px-3.5 py-1.5 btn-aqua font-bold rounded-xl flex items-center gap-1 transition-all shadow-xs"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Order</span>
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
