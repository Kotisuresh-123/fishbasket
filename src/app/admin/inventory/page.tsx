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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Inventory & Catch Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor perishable morning stocks, record trawler batch receipts, and manage wastage
          </p>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="p-4">Seafood Catch</th>
                <th className="p-4">Category</th>
                <th className="p-4">Daily Catch Source</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const isLow = p.stock_quantity <= 25;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-slate-400">Batched Today</div>
                    </td>
                    <td className="p-4 text-slate-600">{p.category_name}</td>
                    <td className="p-4 text-slate-500">{p.origin_source}</td>
                    <td className="p-4">
                      <span className={`font-black text-sm ${isLow ? 'text-rose-700' : 'text-slate-900'}`}>
                        {p.stock_quantity} {p.unit}
                      </span>
                    </td>
                    <td className="p-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          Normal Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAdjustStock(p.id, -5)}
                          className="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-rose-700 font-bold text-xs rounded-lg"
                          title="Deduct 5 kg (Wastage / Spoilage)"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleAdjustStock(p.id, 10)}
                          className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg"
                          title="Restock 10 kg (New Trawler Catch)"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleAdjustStock(p.id, 25)}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg"
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
