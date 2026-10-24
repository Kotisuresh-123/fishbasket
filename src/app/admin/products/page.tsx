'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import { Package, Plus, Search, Edit2, Trash2, Check, RefreshCw, Anchor } from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '@/data/mockData';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New product form state
  const [name, setName] = useState('');
  const [categorySlug, setCategorySlug] = useState('freshwater-fish');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [origin, setOrigin] = useState('Coastal Waters');
  const [stock, setStock] = useState('30');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80');

  const filtered = products.filter((p) => {
    const matchCat = categoryFilter === 'all' || p.category_slug === categoryFilter;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.origin_source.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleToggleAvailable = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_available: !p.is_available } : p))
    );
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    const matchedCat = INITIAL_CATEGORIES.find((c) => c.slug === categorySlug);
    const newP: Product = {
      id: 'p_' + Date.now(),
      category_id: matchedCat?.id || 'c1',
      category_name: matchedCat?.name || 'Seafood',
      category_slug: categorySlug,
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      origin_source: origin,
      description: 'Daily harbor-fresh catch delivered with ice gel pack.',
      price_per_unit: parseFloat(price),
      discount_price: discountPrice ? parseFloat(discountPrice) : undefined,
      unit,
      freshness: 'fresh_catch',
      stock_quantity: parseFloat(stock) || 20,
      min_order_qty: 1,
      is_available: true,
      is_featured: false,
      is_bestseller: false,
      gross_weight_text: 'Gross: 1000g',
      net_yield_text: 'Net Cleaned: 750g',
      estimated_prep_minutes: 15,
      storage_instructions: 'Keep chilled below 4°C.',
      allergen_info: 'Contains seafood.',
      image_url: imageUrl,
      variants: [
        { id: 'v_' + Date.now(), product_id: 'p_' + Date.now(), variant_name: '500g Pack', weight_grams: 500, price: parseFloat(price) / 2, stock_quantity: 10 },
        { id: 'v2_' + Date.now(), product_id: 'p_' + Date.now(), variant_name: '1 kg Pack', weight_grams: 1000, price: parseFloat(price), stock_quantity: 20 },
      ],
      preparation_options: [
        { id: 'prep_' + Date.now(), product_id: 'p_' + Date.now(), name: 'Curry Cut', description: 'Clean curry cut pieces', extra_price: 0, est_weight_loss_percent: 25, is_default: true },
      ],
    };

    setProducts([newP, ...products]);
    setIsAddOpen(false);
    setName('');
    setPrice('');
    setDiscountPrice('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Catalog Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add new daily catches, configure variants, and update real-time availability
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Catch</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catch name, origin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 font-semibold bg-white text-slate-800 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Categories</option>
            {INITIAL_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-2xl border border-teal-200 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Add New Seafood Product</h3>
            <button type="button" onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fresh Red Snapper"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
              >
                {INITIAL_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Origin / Catch Source</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Bay of Bengal Deep Shelf"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Base Price (₹)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 450"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discount Price (₹, Optional)</label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="e.g. 399"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stock Quantity (kg or units)</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
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
              Save Catch to Catalog
            </button>
          </div>
        </form>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="p-4">Seafood Catch</th>
                <th className="p-4">Category</th>
                <th className="p-4">Seller / Fisherman</th>
                <th className="p-4">Origin Source</th>
                <th className="p-4">Price / Unit</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Availability</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                        <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-slate-400 italic">{p.variety_species}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{p.category_name}</td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Anchor className="w-3 h-3 text-teal-600 flex-shrink-0" />
                      <span className="truncate max-w-[130px]">{p.seller_name || 'Visakha Harbor'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-500">{p.origin_source}</td>
                  <td className="p-4 font-bold text-slate-900">
                    {formatINR(p.discount_price ?? p.price_per_unit)} / {p.unit}
                  </td>
                  <td className="p-4 font-semibold text-slate-700">
                    {p.stock_quantity} {p.unit}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleAvailable(p.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        p.is_available
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p.is_available ? 'In Stock' : 'Sold Out'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/product/${p.slug}`}
                      target="_blank"
                      className="text-xs text-teal-700 font-semibold hover:underline"
                    >
                      Preview ↗
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
