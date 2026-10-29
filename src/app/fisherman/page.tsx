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
      <div className="bg-[var(--surface)] rounded-3xl p-6 border border-[var(--border)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
              Hello, {user?.display_name || user?.full_name}!
            </h1>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isApproved
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
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

          <p className="text-xs text-[var(--text-secondary)]">
            {isApproved
              ? 'Your account is approved. You can add and manage your catches.'
              : user?.status === 'suspended'
              ? 'Selling is disabled on your account. Please contact admin.'
              : user?.status === 'rejected'
              ? 'Your application was declined by marketplace administration.'
              : 'Your account is waiting for admin approval.'}
          </p>

          <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5 pt-0.5">
            <Anchor className="w-3 h-3 text-teal-600 dark:text-[#00D2C4]" />
            <span>Landing Center: {user?.dock_location || 'Visakhapatnam Harbor'}</span>
          </div>
        </div>

        {/* Primary Add Catch Action Button */}
        {isApproved && (
          <Link
            href="/fisherman/products/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 btn-aqua font-bold text-xs rounded-2xl shadow-sm transition-all self-start sm:self-auto flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Catch</span>
          </Link>
        )}
      </div>

      {/* 3 Essential Metric Cards (Uncluttered) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Account Status */}
        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[var(--text-secondary)] block">Approval Status</span>
          <div className="text-lg font-black text-[var(--text-primary)] capitalize">
            {user?.status || 'Pending'}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">
            {isApproved ? 'Full Selling Privileges Active' : 'Waiting for Admin Review'}
          </span>
        </div>

        {/* Card 2: Active Catches */}
        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[var(--text-secondary)] block">Active Catches</span>
          <div className="text-2xl font-black text-[var(--text-primary)]">{activeCatchesCount}</div>
          <Link
            href="/fisherman/products"
            className="text-[11px] text-teal-600 dark:text-[#00D2C4] hover:underline font-semibold block"
          >
            Manage My Catches →
          </Link>
        </div>

        {/* Card 3: Orders Requiring Attention */}
        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-[var(--text-secondary)] block">Orders Needing Action</span>
          <div className="text-2xl font-black text-[var(--text-primary)]">
            {ordersRequiringAttention.length}
          </div>
          <Link
            href="/fisherman/orders"
            className="text-[11px] text-teal-600 dark:text-[#00D2C4] hover:underline font-semibold block"
          >
            View Orders Queue →
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-black text-[var(--text-primary)]">Recent Customer Orders</h2>
            <p className="text-xs text-[var(--text-secondary)]">Orders containing your seafood catches</p>
          </div>
          <Link
            href="/fisherman/orders"
            className="text-xs font-bold text-teal-600 dark:text-[#00D2C4] hover:underline"
          >
            View All ({orders.length}) →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-secondary)] text-xs space-y-2">
            <ShoppingBag className="w-8 h-8 text-[var(--text-secondary)] opacity-50 mx-auto" />
            <p className="font-semibold text-[var(--text-primary)]">No orders received yet.</p>
            <p className="text-[11px] max-w-sm mx-auto">
              Once buyers order your seafood, they will appear here for preparation and delivery pickup.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {orders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[var(--text-primary)]">
                      {order.order_number}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/10 text-teal-700 dark:text-[#00D2C4] border border-teal-500/20">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-[var(--text-secondary)] text-[11px] mt-0.5">
                    Customer: <strong className="text-[var(--text-primary)]">{order.customer_name}</strong> •{' '}
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="font-bold text-[var(--text-primary)]">{formatINR(order.total_amount)}</span>
                  <Link
                    href={`/fisherman/orders/${order.id}`}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text-primary)] rounded-lg text-xs font-semibold transition-colors"
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
