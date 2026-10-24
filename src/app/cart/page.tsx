'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/cartUtils';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Truck,
  Tag,
  Scissors,
  Check,
  ShieldCheck,
  Anchor,
  AlertCircle,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    summary,
    fishermanGroups,
    hasMultipleFishermen,
    selectedCheckoutFishermanId,
    setSelectedCheckoutFishermanId,
    updateQuantity,
    removeItem,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    setCouponError(null);
    const res = await applyCoupon(couponInput.trim());
    setIsApplying(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = (fishermanId: string) => {
    setSelectedCheckoutFishermanId(fishermanId);
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Your Basket is Empty</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2">
          Your seafood basket is currently empty. Net fresh fish, prawns, and crabs caught this morning!
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md"
        >
          <span>Explore Fresh Catches</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <Link href="/" className="hover:text-teal-600">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Shopping Basket</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Your Shopping Basket ({summary.itemsCount} {summary.itemsCount === 1 ? 'item' : 'items'})
        </h1>
      </div>

      {hasMultipleFishermen && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-amber-900">
              Single-Fisherman Checkout Policy
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your basket contains fresh catches from <strong>{fishermanGroups.length} different fishermen</strong>. Since each fisherman prepares, packs, and dispatches their catch directly from their respective harbor docks, checkout is completed for <strong>one fisherman at a time</strong>. You can place separate orders for each fisherman without losing your other items.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items Grouped by Fisherman */}
        <div className="lg:col-span-8 space-y-6">
          {fishermanGroups.map((group) => (
            <div
              key={group.fishermanId}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
            >
              {/* Group Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                    ⚓
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider block">
                      Catch Supplier
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">
                      {group.sellerName}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {group.items.length} {group.items.length === 1 ? 'item' : 'items'} • Subtotal:{' '}
                    <strong className="text-slate-900 font-bold">{formatINR(group.subtotal)}</strong>
                  </span>
                  <button
                    onClick={() => handleProceedToCheckout(group.fishermanId)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Checkout This Fisherman</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                          {item.product.category_name}
                        </span>
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="font-bold text-sm text-slate-900 hover:text-teal-700 transition-colors"
                        >
                          {item.product.name}
                        </Link>

                        <div className="text-xs text-slate-500 space-y-0.5">
                          {item.variant && (
                            <div>Weight: <strong className="text-slate-800">{item.variant.variant_name}</strong></div>
                          )}
                          {item.preparation_option && (
                            <div className="flex items-center gap-1 text-teal-700">
                              <Scissors className="w-3.5 h-3.5" />
                              <span>{item.preparation_option.name}</span>
                              {item.cleaning_fee > 0 && <span>(+{formatINR(item.cleaning_fee)})</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-5">
                      <div className="flex items-center bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 text-slate-700"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 text-slate-700"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-slate-900 block">
                          {formatINR(item.item_total)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatINR(item.unit_price + item.cleaning_fee)} / unit
                        </span>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Bill Summary */}
        <div className="lg:col-span-4 space-y-4">
          {/* Coupon Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-teal-600" /> Apply Coupon
            </h3>

            {coupon ? (
              <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs">
                <div>
                  <span className="font-bold text-teal-900 block">{coupon.code}</span>
                  <span className="text-[10px] text-teal-700">
                    Saved {formatINR(summary.discountAmount)}!
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-semibold"
                  />
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isApplying ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-xs text-rose-600 font-medium">{couponError}</p>}
              </form>
            )}
          </div>

          {/* Overall Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              Order Pricing (Cash on Delivery)
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Basket Subtotal</span>
                <span className="font-medium text-slate-800">{formatINR(summary.subtotal)}</span>
              </div>
              {summary.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promotional Savings</span>
                  <span>-{formatINR(summary.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Estimated Delivery Fee</span>
                <span>{summary.deliveryFee === 0 ? 'FREE' : formatINR(summary.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-100">
                <span>Total Amount (COD)</span>
                <span>{formatINR(summary.totalAmount)}</span>
              </div>
            </div>

            {hasMultipleFishermen ? (
              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                Choose a specific fisherman group on the left to proceed to checkout.
              </p>
            ) : (
              <button
                onClick={() => handleProceedToCheckout(fishermanGroups[0]?.fishermanId || 'platform')}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span>Proceed to Cash on Delivery Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Inspection on delivery • Cash / UPI accepted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
