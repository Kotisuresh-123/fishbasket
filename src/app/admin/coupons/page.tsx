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
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Promotions & Coupons</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Configure discount codes, minimum order value requirements, and active campaigns
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 btn-aqua font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {isAddOpen && (
        <form onSubmit={handleAddCoupon} className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-lg space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Create New Coupon Code</h3>
            <button type="button" onClick={() => setIsAddOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm cursor-pointer">✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Coupon Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. MONSOON50"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] font-mono font-bold focus:outline-none focus:border-[#00D2C4]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Discount Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] font-medium focus:outline-none focus:border-[#00D2C4]"
              >
                <option value="fixed">Fixed Amount (₹)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Discount Value</label>
              <input
                type="number"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 100 or 20"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] font-bold focus:outline-none focus:border-[#00D2C4]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Min Order Amount (₹)</label>
              <input
                type="number"
                required
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Description</label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="e.g. Flat ₹100 off on freshwater catches above ₹699"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 btn-aqua rounded-xl text-xs font-bold cursor-pointer"
            >
              Save Coupon
            </button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-elevated)] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[10px] border-b border-[var(--border)]">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Description</th>
                <th className="p-4">Min Order</th>
                <th className="p-4">Redemptions</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--surface-elevated)] transition-colors">
                  <td className="p-4">
                    <span className="font-mono font-black text-sm text-[#00D2C4] bg-[#00D2C4]/10 px-2 py-0.5 rounded border border-[#00D2C4]/20">
                      {c.code}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-[var(--text-primary)]">
                    {c.discount_type === 'fixed' ? `₹${c.discount_value} OFF` : `${c.discount_value}% OFF`}
                  </td>
                  <td className="p-4 text-[var(--text-secondary)] max-w-xs">{c.description}</td>
                  <td className="p-4 font-semibold text-[var(--text-primary)]">
                    {formatINR(c.min_order_amount)}
                  </td>
                  <td className="p-4 text-[var(--text-secondary)]">{c.used_count} used</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleActive(c.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                        c.is_active ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border)]'
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
