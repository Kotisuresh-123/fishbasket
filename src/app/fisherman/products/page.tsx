'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import {
  Fish,
  PlusCircle,
  Edit3,
  Trash2,
  Check,
  AlertCircle,
  Search,
  RefreshCw,
} from 'lucide-react';

export default function FishermanProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadProducts = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/products?fishermanId=${encodeURIComponent(user.id)}`);
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user]);

  const handleToggleAvailability = async (product: Product) => {
    if (!user) return;
    const newStatus = !product.is_available;
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_available: newStatus,
          requesterId: user.id,
          requesterRole: user.role,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? data.product : p))
        );
        setActionMsg(`"${product.name}" is now marked as ${newStatus ? 'In Stock' : 'Out of Stock'}.`);
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch {
      // Ignore
    }
  };

  const handleDeleteListing = async (productId: string, name: string) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to delete catch listing "${name}"?`)) return;

    try {
      const res = await fetch(
        `/api/products/${productId}?requesterId=${encodeURIComponent(user.id)}&requesterRole=${encodeURIComponent(user.role)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setActionMsg(`Listing "${name}" deleted.`);
        setTimeout(() => setActionMsg(null), 3000);
      } else {
        alert(data.message || 'Error deleting listing');
      }
    } catch {
      alert('Network error deleting listing');
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Catches
          </h1>
          <p className="text-xs text-slate-500">
            View and manage your active seafood listings, stock, and preparation cuts
          </p>
        </div>

        <Link
          href="/fisherman/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Catch</span>
        </Link>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search your catches by name, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <button
          onClick={loadProducts}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl border border-slate-200"
          title="Refresh listings"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading your catches...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Fish className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">No catches found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven&apos;t added any catches yet. Publish your fresh harvest to start selling to local customers!
            </p>
            <Link
              href="/fisherman/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Your First Catch</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Catch Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{product.name}</div>
                          {product.variety_species && (
                            <div className="text-[11px] text-slate-400 italic">
                              {product.variety_species}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {product.category_name}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatINR(product.price_per_unit)} / {product.unit}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">
                        {product.stock_quantity} {product.unit}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleAvailability(product)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          product.is_available
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {product.is_available ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/fisherman/products/${product.id}`}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Edit Catch"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteListing(product.id, product.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
