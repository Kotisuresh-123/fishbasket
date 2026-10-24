'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { Order } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import { Package, MapPin, Heart, ArrowRight, Truck, Clock } from 'lucide-react';

export default function AccountOverviewPage() {
  const { user, defaultAddress } = useAuth();
  const { wishlistCount } = useWishlist();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.orders);
      })
      .catch(() => {});
  }, []);

  const latestOrder = orders[0];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <Package className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{orders.length}</div>
          <Link href="/account/orders" className="text-[11px] text-teal-700 font-semibold mt-1 inline-block">
            View history →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Default Address</span>
            <MapPin className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {defaultAddress ? defaultAddress.city : 'No Address'}
          </div>
          <Link href="/account/addresses" className="text-[11px] text-teal-700 font-semibold mt-1 inline-block">
            Manage addresses →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Wishlist</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{wishlistCount}</div>
          <Link href="/account/wishlist" className="text-[11px] text-teal-700 font-semibold mt-1 inline-block">
            View saved catches →
          </Link>
        </div>
      </div>

      {/* Latest Active Order Banner */}
      {latestOrder && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Most Recent Catch Order
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-100 text-teal-800">
                {latestOrder.status.replace(/_/g, ' ')}
              </span>
            </div>
            <Link
              href={`/track-order/${latestOrder.id}`}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Track Live</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Order Ref</span>
              <strong className="text-slate-900 font-mono">{latestOrder.order_number}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Delivery Slot</span>
              <span className="text-slate-800 font-medium">{latestOrder.delivery_slot.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Total Paid</span>
              <span className="text-teal-800 font-bold text-sm">
                {formatINR(latestOrder.total_amount)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Link */}
      <div className="bg-teal-50 border border-teal-200 p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h4 className="font-bold text-teal-950 text-sm">Craving fresh fish or prawns today?</h4>
          <p className="text-xs text-teal-800 mt-0.5">Explore the morning trawler netting catalog.</p>
        </div>
        <Link
          href="/shop"
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
        >
          Browse Fresh Catch
        </Link>
      </div>
    </div>
  );
}
