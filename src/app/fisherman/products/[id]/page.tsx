'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import {
  Fish,
  ArrowLeft,
  Check,
  Trash2,
  Plus,
  AlertCircle,
  Scissors,
} from 'lucide-react';

export default function EditFishermanProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [prepOptions, setPrepOptions] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      if (!productId || !user) return;
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (!data.success || !data.product) {
          setErrorMsg('Product listing not found.');
          setLoading(false);
          return;
        }
        const p: Product = data.product;
        // Strict ownership check:
        if (p.fisherman_id !== user.id && user.role !== 'admin') {
          setErrorMsg('Unauthorized: You can only edit listings belonging to your boat.');
          setLoading(false);
          return;
        }
        setProduct(p);
        setName(p.name);
        setPricePerUnit(p.price_per_unit);
        setDiscountPrice(p.discount_price);
        setStockQuantity(p.stock_quantity);
        setIsAvailable(p.is_available);
        setDescription(p.description);
        setImageUrl(p.image_url);
        setPrepOptions(p.preparation_options || []);
      } catch {
        setErrorMsg('Failed to fetch listing details.');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId, user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const updates: Partial<Product> = {
      name: name.trim(),
      price_per_unit: pricePerUnit,
      discount_price: discountPrice || undefined,
      stock_quantity: stockQuantity,
      is_available: stockQuantity > 0 ? isAvailable : false,
      description: description.trim(),
      image_url: imageUrl.trim(),
      preparation_options: prepOptions,
    };

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          requesterId: user.id,
          requesterRole: user.role,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Listing updated successfully!');
        setTimeout(() => router.push('/fisherman/products'), 1200);
      } else {
        setErrorMsg(data.message || 'Error updating listing.');
      }
    } catch {
      setErrorMsg('Network error updating listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading listing details...</div>;
  }

  if (errorMsg && !product) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-[var(--surface)] rounded-2xl border border-rose-500/20 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="font-bold text-sm text-[var(--text-primary)]">{errorMsg}</h2>
        <Link href="/fisherman/products" className="text-xs font-bold text-teal-600 dark:text-[#00D2C4] underline block">
          Back to Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/fisherman/products"
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 mb-1 font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Listings
        </Link>
        <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
          Edit Catch: {product?.name}
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Update prices, available catch stock, and custom cleaning options
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-400 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Catch Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Price (₹ per {product?.unit})
              </label>
              <input
                type="number"
                min={1}
                required
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Discount Price (₹, Optional)
              </label>
              <input
                type="number"
                min={1}
                value={discountPrice || ''}
                onChange={(e) => setDiscountPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Live Catch Stock ({product?.unit})
              </label>
              <input
                type="number"
                min={0}
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Public Listing Status
              </label>
              <select
                value={isAvailable ? 'true' : 'false'}
                onChange={(e) => setIsAvailable(e.target.value === 'true')}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
              >
                <option value="true">Active (Purchasable)</option>
                <option value="false">Hidden / Out of Stock</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Seafood Image URL
              </label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Catch Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/fisherman/products"
            className="px-5 py-2.5 border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] rounded-xl text-xs font-bold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-aqua px-7 py-3 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Listing Updates'}
          </button>
        </div>
      </form>
    </div>
  );
}
