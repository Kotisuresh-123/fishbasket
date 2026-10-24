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
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Overview</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Essential marketplace performance metrics and orders requiring attention
        </p>
      </div>

      {/* 4 Essential Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{orders.length}</div>
          <Link href="/admin/orders" className="text-[11px] text-teal-700 hover:underline font-semibold block">
            View orders →
          </Link>
        </div>

        {/* Revenue Summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Total Sales</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formatINR(totalRevenue)}</div>
          <span className="text-[11px] text-slate-400 font-medium block">
            Collected revenue
          </span>
        </div>

        {/* Orders Needing Attention */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Needs Attention</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800">{ordersNeedingAttention.length}</div>
          <Link href="/admin/orders" className="text-[11px] text-amber-800 hover:underline font-semibold block">
            Fulfill orders →
          </Link>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{lowStockProducts.length}</div>
          <Link href="/admin/inventory" className="text-[11px] text-rose-700 hover:underline font-semibold block">
            Review stock →
          </Link>
        </div>
      </div>

      {/* Simplified Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Recent Customer Orders</h3>
            <p className="text-xs text-slate-400">Latest seafood orders placed across all fishermen</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{o.order_number}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{o.customer_name}</div>
                    <div className="text-slate-400 text-[11px]">{o.customer_phone}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatINR(o.total_amount)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-50 text-teal-700 border border-teal-200">
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/orders`}
                      className="px-3 py-1 bg-slate-100 hover:bg-teal-50 text-teal-800 rounded-lg font-bold text-[11px] inline-block"
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
