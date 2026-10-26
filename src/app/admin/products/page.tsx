'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import { useAuth } from '@/context/AuthContext';
import { Package, Plus, Search, Edit2, Trash2, Check, RefreshCw, Anchor } from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '@/data/mockData';

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New product form state
  const [name, setName] = useState('');
  const [categorySlug, setCategorySlug] = useState('freshwater-fish');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [origin, setOrigin] = useState('Coastal Waters');
  const [stock, setStock] = useState('30');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80');

  const fetchLiveProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
      }
    } catch (e) {
      console.error('Failed to fetch live products:', e);
    }
  };

  useEffect(() => {
    fetchLiveProducts();
  }, []);

  const filtered = products.filter((p) => {
    const matchCat = categoryFilter === 'all' || p.category_slug === categoryFilter;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.origin_source || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleToggleAvailable = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const newAvail = !target.is_available;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_available: newAvail } : p))
    );

    try {
      await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_available: newAvail,
          requesterId: user?.id || '22222222-2222-2222-2222-222222222222',
          requesterRole: 'admin',
        }),
      });
    } catch {
      // Revert on failure
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_available: !newAvail } : p))
      );
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || isSubmitting) return;

    setIsSubmitting(true);
    const matchedCat = INITIAL_CATEGORIES.find((c) => c.slug === categorySlug);
    const generatedSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);

    const payload = {
      category_id: matchedCat?.id || 'c1000000-0000-0000-0000-000000000001',
      category_name: matchedCat?.name || 'Seafood',
      category_slug: categorySlug,
      name: name.trim(),
      slug: generatedSlug,
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
      requesterId: user?.id || '22222222-2222-2222-2222-222222222222',
      requesterRole: 'admin',
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) => [data.product, ...prev]);
        setIsAddOpen(false);
        setName('');
        setPrice('');
        setDiscountPrice('');
      } else {
        alert(data.message || 'Failed to save product to database.');
      }
    } catch {
      alert('Network error while saving product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Product Catalog Management</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Add new daily catches, configure variants, and update real-time availability
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="btn-aqua px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Catch</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catch name, origin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#00D2C4]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[var(--text-secondary)] font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[var(--border)] font-semibold bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4]"
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
        <form onSubmit={handleAddProduct} className="bg-[var(--surface)] p-6 rounded-2xl border border-teal-500/30 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Add New Seafood Product</h3>
            <button type="button" onClick={() => setIsAddOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm">✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fresh Red Snapper"
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Category</label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4]"
              >
                {INITIAL_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Origin / Catch Source</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Bay of Bengal Deep Shelf"
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Base Price (₹)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 450"
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Discount Price (₹, Optional)</label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="e.g. 399"
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Stock Quantity (kg or units)</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4]"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-aqua px-5 py-2 font-bold rounded-xl text-xs"
            >
              Save Catch to Catalog
            </button>
          </div>
        </form>
      )}

      {/* Products Table */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-elevated)] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[10px] border-b border-[var(--border)]">
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
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--surface-elevated)]/60 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[var(--surface-elevated)] border border-[var(--border)] flex-shrink-0">
                        <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-[var(--text-primary)]">{p.name}</div>
                        <div className="text-[10px] text-[var(--text-secondary)] italic">{p.variety_species}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-[var(--text-secondary)] font-medium">{p.category_name}</td>
                  <td className="p-4">
                    <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Anchor className="w-3 h-3 text-teal-600 dark:text-[#00D2C4] flex-shrink-0" />
                      <span className="truncate max-w-[130px]">{p.seller_name || 'Visakha Harbor'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[var(--text-secondary)]">{p.origin_source}</td>
                  <td className="p-4 font-bold text-[var(--text-primary)]">
                    {formatINR(p.discount_price ?? p.price_per_unit)} / {p.unit}
                  </td>
                  <td className="p-4 font-semibold text-[var(--text-primary)]">
                    {p.stock_quantity} {p.unit}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleAvailable(p.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                        p.is_available
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {p.is_available ? 'In Stock' : 'Sold Out'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/product/${p.slug}`}
                      target="_blank"
                      className="text-xs text-teal-600 dark:text-[#00D2C4] font-semibold hover:underline"
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
