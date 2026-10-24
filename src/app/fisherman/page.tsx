'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Order, Product } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import {
  Fish,
  ShoppingBag,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Anchor,
  ShieldCheck,
} from 'lucide-react';

export default function FishermanOverviewPage() {
  const { user, refreshProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        // Refresh profile from server to guarantee fresh authoritative approval status
        refreshProfile();

        const [prodRes, ordRes] = await Promise.all([
          fetch(`/api/products?fishermanId=${encodeURIComponent(user.id)}`),
          fetch(`/api/orders?fishermanId=${encodeURIComponent(user.id)}`),
        ]);

        const prodData = await prodRes.json();
        const ordData = await ordRes.json();

        if (prodData.success && prodData.products) {
          setProducts(prodData.products);
        }

        if (ordData.success && ordData.orders) {
          setOrders(ordData.orders);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, refreshProfile]);

  const activeCatchesCount = products.filter((p) => p.is_available && p.stock_quantity > 0).length;
  const ordersRequiringAttention = orders.filter(
    (o) =>
      o.status === 'confirmed' ||
      o.status === 'accepted_for_prep' ||
      o.status === 'preparing' ||
      o.status === 'ready_for_pickup'
  );

  const isApproved = user?.status === 'approved';

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading fisherman dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Approval Status Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Hello, {user?.display_name || user?.full_name}!
            </h1>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isApproved
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isApproved ? (
                <>
                  <ShieldCheck className="w-3 h-3" /> Approved Fisherman
                </>
              ) : (
                'Pending Approval'
              )}
            </span>
          </div>

          <p className="text-xs text-slate-600">
            {isApproved
              ? 'Your account is approved. You can add and manage your catches.'
              : user?.status === 'suspended'
              ? 'Selling is disabled on your account. Please contact admin.'
              : user?.status === 'rejected'
              ? 'Your application was declined by marketplace administration.'
              : 'Your account is waiting for admin approval.'}
          </p>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
            <Anchor className="w-3 h-3 text-teal-600" />
            <span>Landing Center: {user?.dock_location || 'Visakhapatnam Harbor'}</span>
          </div>
        </div>

        {/* Primary Add Catch Action Button */}
        {isApproved && (
          <Link
            href="/fisherman/products/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-2xl shadow-sm transition-colors self-start sm:self-auto flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Catch</span>
          </Link>
        )}
      </div>

      {/* 3 Essential Metric Cards (Uncluttered) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Account Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 block">Approval Status</span>
          <div className="text-lg font-black text-slate-900 capitalize">
            {user?.status || 'Pending'}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block">
            {isApproved ? 'Full Selling Privileges Active' : 'Waiting for Admin Review'}
          </span>
        </div>

        {/* Card 2: Active Catches */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 block">Active Catches</span>
          <div className="text-2xl font-black text-slate-900">{activeCatchesCount}</div>
          <Link
            href="/fisherman/products"
            className="text-[11px] text-teal-700 hover:underline font-semibold block"
          >
            Manage My Catches →
          </Link>
        </div>

        {/* Card 3: Orders Requiring Attention */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 block">Orders Needing Action</span>
          <div className="text-2xl font-black text-slate-900">
            {ordersRequiringAttention.length}
          </div>
          <Link
            href="/fisherman/orders"
            className="text-[11px] text-teal-700 hover:underline font-semibold block"
          >
            View Orders Queue →
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-900">Recent Customer Orders</h2>
            <p className="text-xs text-slate-400">Orders containing your seafood catches</p>
          </div>
          <Link
            href="/fisherman/orders"
            className="text-xs font-bold text-teal-700 hover:underline"
          >
            View All ({orders.length}) →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">No orders received yet.</p>
            <p className="text-[11px] max-w-sm mx-auto">
              Once buyers order your seafood, they will appear here for preparation and delivery pickup.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">
                      {order.order_number}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-50 text-teal-800">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Customer: <strong className="text-slate-700">{order.customer_name}</strong> •{' '}
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="font-bold text-slate-900">{formatINR(order.total_amount)}</span>
                  <Link
                    href={`/fisherman/orders/${order.id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Manage Prep →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
