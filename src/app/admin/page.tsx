import React from 'react';
import Link from 'next/link';
import { dbService } from '@/lib/db';
import { formatINR } from '@/lib/cartUtils';
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export default async function AdminOverviewPage() {
  const orders = await dbService.getOrders();
  const products = await dbService.getProducts();

  const totalRevenue = orders
    .filter((o) => o.payment_status === 'success')
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  const ordersNeedingAttention = orders.filter(
    (o) => o.status === 'confirmed' || o.status === 'accepted_for_prep' || o.status === 'preparing'
  );

  const lowStockProducts = products.filter((p) => p.stock_quantity <= 15);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Admin Overview</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Essential marketplace performance metrics and orders requiring attention
        </p>
      </div>

      {/* 4 Essential Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-semibold">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-teal-600 dark:text-[#00D2C4]" />
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">{orders.length}</div>
          <Link href="/admin/orders" className="text-[11px] text-teal-600 dark:text-[#00D2C4] hover:underline font-semibold block">
            View orders →
          </Link>
        </div>

        {/* Revenue Summary */}
        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-semibold">Total Sales</span>
            <IndianRupee className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)]">{formatINR(totalRevenue)}</div>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium block">
            Collected revenue
          </span>
        </div>

        {/* Orders Needing Attention */}
        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-semibold">Needs Attention</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{ordersNeedingAttention.length}</div>
          <Link href="/admin/orders" className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-semibold block">
            Fulfill orders →
          </Link>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-xs font-semibold">Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{lowStockProducts.length}</div>
          <Link href="/admin/inventory" className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-semibold block">
            Review stock →
          </Link>
        </div>
      </div>

      {/* Simplified Recent Orders Table */}
      <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Recent Customer Orders</h3>
            <p className="text-xs text-[var(--text-secondary)]">Latest seafood orders placed across all fishermen</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-teal-600 dark:text-[#00D2C4] hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-elevated)] text-[var(--text-secondary)] font-semibold border-b border-[var(--border)]">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-[var(--surface-elevated)]/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[var(--text-primary)]">{o.order_number}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[var(--text-primary)]">{o.customer_name}</div>
                    <div className="text-[var(--text-secondary)] text-[11px]">{o.customer_phone}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{formatINR(o.total_amount)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-500/10 text-teal-700 dark:text-[#00D2C4] border border-teal-500/20">
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/orders`}
                      className="px-3 py-1 bg-[var(--surface-elevated)] hover:bg-teal-500/20 text-teal-700 dark:text-[#00D2C4] rounded-lg font-bold text-[11px] inline-block transition-colors"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
