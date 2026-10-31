'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { Order } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import { Package, MapPin, Heart, ArrowRight, Truck, Clock } from 'lucide-react';

export default function AccountOverviewPage() {
  const { user, defaultAddress, isLoaded } = useAuth();
  const { wishlistCount } = useWishlist();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setOrders([]);
      return;
    }

    fetch(`/api/orders?userId=${encodeURIComponent(user.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.orders)) setOrders(data.orders);
      })
      .catch(() => {});
  }, [user?.id, isLoaded]);

  const latestOrder = orders[0];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-[#00D2C4]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">{orders.length}</div>
          <Link href="/account/orders" className="text-[11px] text-teal-600 dark:text-[#00D2C4] font-semibold mt-1 inline-block hover:underline">
            View history →
          </Link>
        </div>

        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Default Address</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-[#00D2C4]">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-[var(--text-primary)] truncate">
            {defaultAddress ? defaultAddress.city : 'No Address'}
          </div>
          <Link href="/account/addresses" className="text-[11px] text-teal-600 dark:text-[#00D2C4] font-semibold mt-1 inline-block hover:underline">
            Manage addresses →
          </Link>
        </div>

        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Wishlist</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">{wishlistCount}</div>
          <Link href="/account/wishlist" className="text-[11px] text-teal-600 dark:text-[#00D2C4] font-semibold mt-1 inline-block hover:underline">
            View saved catches →
          </Link>
        </div>
      </div>

      {/* Latest Active Order Banner */}
      {latestOrder && (
        <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Most Recent Catch Order
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-500/10 text-teal-700 dark:text-[#00D2C4] border border-teal-500/20">
                {latestOrder.status.replace(/_/g, ' ')}
              </span>
            </div>
            <Link
              href={`/track-order/${latestOrder.id}`}
              className="text-xs font-bold text-teal-600 dark:text-[#00D2C4] hover:underline flex items-center gap-1"
            >
              <span>Track Live</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[var(--text-secondary)] block text-[10px]">Order Ref</span>
              <strong className="text-[var(--text-primary)] font-mono">{latestOrder.order_number}</strong>
            </div>
            <div>
              <span className="text-[var(--text-secondary)] block text-[10px]">Delivery Slot</span>
              <span className="text-[var(--text-primary)] font-medium">{latestOrder.delivery_slot.name}</span>
            </div>
            <div>
              <span className="text-[var(--text-secondary)] block text-[10px]">Total Paid</span>
              <span className="text-teal-700 dark:text-[#00D2C4] font-bold text-sm">
                {formatINR(latestOrder.total_amount)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Link */}
      <div className="bg-gradient-to-r from-teal-500/10 via-teal-500/5 to-transparent border border-teal-500/20 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-[var(--text-primary)] text-sm">Craving fresh fish or prawns today?</h4>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Explore the morning trawler netting catalog.</p>
        </div>
        <Link
          href="/shop"
          className="px-4 py-2.5 btn-aqua font-bold text-xs rounded-xl transition-all shadow-xs self-start sm:self-auto"
        >
          Browse Fresh Catch
        </Link>
      </div>
    </div>
  );
}
