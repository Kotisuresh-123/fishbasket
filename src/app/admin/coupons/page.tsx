'use client';

import React, { useState } from 'react';
import { Coupon } from '@/types';
import { INITIAL_COUPONS } from '@/data/mockData';
import { formatINR } from '@/lib/cartUtils';
import { Tag, Plus, Check } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [code, setCode] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'fixed' | 'percentage'>('fixed');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('499');

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !value) return;

    const newCoupon: Coupon = {
      id: 'cp_' + Date.now(),
      code: code.trim().toUpperCase(),
      description: desc.trim(),
      discount_type: type,
      discount_value: parseFloat(value),
      min_order_amount: parseFloat(minOrder) || 0,
      starts_at: new Date().toISOString(),
      is_active: true,
      used_count: 0,
    };

    setCoupons([newCoupon, ...coupons]);
    setIsAddOpen(false);
    setCode('');
    setValue('');
    setDesc('');
  };

  const handleToggleActive = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: !c.is_active } : c))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Promotions & Coupons</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure discount codes, minimum order value requirements, and active campaigns
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {isAddOpen && (
        <form onSubmit={handleAddCoupon} className="bg-white p-6 rounded-2xl border border-teal-200 shadow-lg space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Create New Coupon Code</h3>
            <button type="button" onClick={() => setIsAddOpen(false)} className="text-slate-400 text-sm">✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Coupon Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. MONSOON50"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discount Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-teal-500"
              >
                <option value="fixed">Fixed Amount (₹)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discount Value</label>
              <input
                type="number"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 100 or 20"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min Order Amount (₹)</label>
              <input
                type="number"
                required
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="e.g. Flat ₹100 off on freshwater catches above ₹699"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
            >
              Save Coupon
            </button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Description</th>
                <th className="p-4">Min Order</th>
                <th className="p-4">Redemptions</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <span className="font-mono font-black text-sm text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {c.code}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-900">
                    {c.discount_type === 'fixed' ? `₹${c.discount_value} OFF` : `${c.discount_value}% OFF`}
                  </td>
                  <td className="p-4 text-slate-600 max-w-xs">{c.description}</td>
                  <td className="p-4 font-semibold text-slate-700">
                    {formatINR(c.min_order_amount)}
                  </td>
                  <td className="p-4 text-slate-600">{c.used_count} used</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleActive(c.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {c.is_active ? 'Active' : 'Disabled'}
                    </button>
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
