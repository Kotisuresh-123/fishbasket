'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { INITIAL_PRODUCTS } from '@/data/mockData';
import { Boxes, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');

  const handleAdjustStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = Math.max(0, p.stock_quantity + delta);
          return { ...p, stock_quantity: updated, is_available: updated > 0 };
        }
        return p;
      })
    );
    setAdjustingId(null);
    setAdjustAmount('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
            Inventory & Catch Management
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Monitor perishable morning stocks, record trawler batch receipts, and manage wastage
          </p>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-elevated)] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[10px] border-b border-[var(--border)]">
              <tr>
                <th className="p-4">Seafood Catch</th>
                <th className="p-4">Category</th>
                <th className="p-4">Daily Catch Source</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {products.map((p) => {
                const isLow = p.stock_quantity <= 25;
                return (
                  <tr key={p.id} className="hover:bg-[var(--surface-elevated)] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[var(--text-primary)]">{p.name}</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">Batched Today</div>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)]">{p.category_name}</td>
                    <td className="p-4 text-[var(--text-secondary)]">{p.origin_source}</td>
                    <td className="p-4">
                      <span className={`font-black text-sm ${isLow ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>
                        {p.stock_quantity} {p.unit}
                      </span>
                    </td>
                    <td className="p-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/15 text-rose-500 border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                          Normal Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAdjustStock(p.id, -5)}
                          className="px-2.5 py-1 bg-[var(--surface-elevated)] hover:bg-rose-500/20 text-rose-500 border border-[var(--border)] font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          title="Deduct 5 kg (Wastage / Spoilage)"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleAdjustStock(p.id, 10)}
                          className="px-2.5 py-1 bg-[var(--surface-elevated)] hover:bg-emerald-500/20 text-emerald-500 border border-[var(--border)] font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          title="Restock 10 kg (New Trawler Catch)"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleAdjustStock(p.id, 25)}
                          className="px-3 py-1 btn-aqua text-xs rounded-lg font-bold shadow-xs cursor-pointer"
                          title="Restock 25 kg (New Batch Receipt)"
                        >
                          +25
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
