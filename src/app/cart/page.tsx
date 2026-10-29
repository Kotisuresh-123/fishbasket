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
  Tag,
  Scissors,
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
        <div className="w-20 h-20 rounded-2xl bg-[#EDF3F5] dark:bg-[#17232E] flex items-center justify-center mx-auto text-[#7E92A2] dark:text-[#6B7F91] mb-4 border border-[#DCE5EA] dark:border-[#243444]">
          <ShoppingBag className="w-10 h-10 text-[#00D2C4]" />
        </div>
        <h1 className="text-2xl font-black text-[#112233] dark:text-[#EAF2F8]">Your Basket is Empty</h1>
        <p className="text-xs sm:text-sm text-[#52667A] dark:text-[#9DB0C0] max-w-md mx-auto mt-2">
          Your seafood basket is currently empty. Net fresh fish, prawns, and crabs caught this morning!
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 btn-aqua font-black text-sm rounded-xl transition-all shadow-md"
        >
          <span>Explore Fresh Catches</span>
          <ArrowRight className="w-4 h-4 text-[#112233]" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-[#7E92A2] dark:text-[#6B7F91] mb-1">
          <Link href="/" className="hover:text-[#00D2C4] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#112233] dark:text-[#EAF2F8] font-semibold">Shopping Basket</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#112233] dark:text-[#EAF2F8] tracking-tight">
          Your Shopping Basket ({summary.itemsCount} {summary.itemsCount === 1 ? 'item' : 'items'})
        </h1>
      </div>

      {hasMultipleFishermen && (
        <div className="mb-6 p-4 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200">
              Single-Fisherman Checkout Policy
            </h3>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
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
              className="bg-white dark:bg-[#17232E] rounded-2xl border border-[#DCE5EA] dark:border-[#243444] overflow-hidden shadow-xs transition-colors"
            >
              {/* Group Header */}
              <div className="p-4 bg-[#F8FAFA] dark:bg-[#121C25] border-b border-[#DCE5EA] dark:border-[#243444] flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#00D2C4]/20 text-[#009E93] dark:text-[#00D2C4] flex items-center justify-center font-bold text-xs border border-[#00D2C4]/30">
                    <Anchor className="w-4 h-4 text-[#00D2C4]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#009E93] dark:text-[#00D2C4] tracking-wider block">
                      Catch Supplier
                    </span>
                    <h3 className="font-bold text-sm text-[#112233] dark:text-[#EAF2F8]">
                      {group.sellerName}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#52667A] dark:text-[#9DB0C0]">
                    {group.items.length} {group.items.length === 1 ? 'item' : 'items'} • Subtotal:{' '}
                    <strong className="text-[#112233] dark:text-[#EAF2F8] font-bold">{formatINR(group.subtotal)}</strong>
                  </span>
                  <button
                    onClick={() => handleProceedToCheckout(group.fishermanId)}
                    className="px-4 py-2 btn-aqua font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Checkout This Fisherman</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#112233]" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#DCE5EA] dark:divide-[#243444]">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#EDF3F5] dark:bg-[#121C25] border border-[#DCE5EA] dark:border-[#243444] flex-shrink-0">
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#009E93] dark:text-[#00D2C4] uppercase tracking-wider block">
                          {item.product.category_name}
                        </span>
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="font-bold text-sm text-[#112233] dark:text-[#EAF2F8] hover:text-[#00D2C4] transition-colors"
                        >
                          {item.product.name}
                        </Link>

                        <div className="text-xs text-[#52667A] dark:text-[#9DB0C0] space-y-0.5">
                          {item.variant && (
                            <div>Weight: <strong className="text-[#112233] dark:text-[#EAF2F8]">{item.variant.variant_name}</strong></div>
                          )}
                          {item.preparation_option && (
                            <div className="flex items-center gap-1 text-[#009E93] dark:text-[#00D2C4]">
                              <Scissors className="w-3.5 h-3.5 text-[#00D2C4]" />
                              <span>{item.preparation_option.name}</span>
                              {item.cleaning_fee > 0 && <span>(+{formatINR(item.cleaning_fee)})</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-5">
                      <div className="flex items-center bg-[#EDF3F5] dark:bg-[#121C25] rounded-xl overflow-hidden border border-[#DCE5EA] dark:border-[#243444]">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-[#1F2E3D] text-[#112233] dark:text-[#EAF2F8] transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-[#112233] dark:text-[#EAF2F8]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-[#1F2E3D] text-[#112233] dark:text-[#EAF2F8] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-[#112233] dark:text-[#EAF2F8] block">
                          {formatINR(item.item_total)}
                        </span>
                        <span className="text-[11px] text-[#7E92A2] dark:text-[#6B7F91]">
                          {formatINR(item.unit_price + item.cleaning_fee)} / unit
                        </span>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-[#7E92A2] dark:text-[#6B7F91] hover:text-rose-500 transition-colors cursor-pointer"
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
          <div className="bg-white dark:bg-[#17232E] p-5 rounded-2xl border border-[#DCE5EA] dark:border-[#243444] shadow-xs space-y-3 transition-colors">
            <h3 className="font-bold text-sm text-[#112233] dark:text-[#EAF2F8] flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#00D2C4]" /> Apply Coupon
            </h3>

            {coupon ? (
              <div className="flex items-center justify-between bg-[#00D2C4]/15 border border-[#00D2C4]/35 rounded-xl p-3 text-xs">
                <div>
                  <span className="font-bold text-[#009E93] dark:text-[#00D2C4] block">{coupon.code}</span>
                  <span className="text-[10px] text-[#52667A] dark:text-[#9DB0C0]">
                    Saved {formatINR(summary.discountAmount)}!
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-rose-500 hover:text-rose-600 font-bold underline cursor-pointer"
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
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#DCE5EA] dark:border-[#243444] bg-[#EDF3F5] dark:bg-[#0F1820] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:border-[#00D2C4] font-semibold placeholder:text-[#7E92A2] dark:placeholder:text-[#6B7F91]"
                  />
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="px-4 py-2 bg-[#112233] hover:bg-[#1A334D] text-white dark:bg-[#1F2E3D] dark:hover:bg-[#2A3F53] font-bold text-xs rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isApplying ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-xs text-rose-500 font-medium">{couponError}</p>}
              </form>
            )}
          </div>

          {/* Overall Summary Card */}
          <div className="bg-white dark:bg-[#17232E] p-6 rounded-2xl border border-[#DCE5EA] dark:border-[#243444] shadow-xs space-y-4 transition-colors">
            <h3 className="font-bold text-sm text-[#112233] dark:text-[#EAF2F8] border-b border-[#DCE5EA] dark:border-[#243444] pb-3">
              Order Pricing (Cash on Delivery)
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-[#52667A] dark:text-[#9DB0C0]">
                <span>Basket Subtotal</span>
                <span className="font-semibold text-[#112233] dark:text-[#EAF2F8]">{formatINR(summary.subtotal)}</span>
              </div>
              {summary.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Promotional Savings</span>
                  <span>-{formatINR(summary.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#52667A] dark:text-[#9DB0C0]">
                <span>Estimated Delivery Fee</span>
                <span className="font-semibold text-[#112233] dark:text-[#EAF2F8]">{summary.deliveryFee === 0 ? 'FREE' : formatINR(summary.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#112233] dark:text-[#EAF2F8] pt-3 border-t border-[#DCE5EA] dark:border-[#243444]">
                <span>Total Amount (COD)</span>
                <span className="text-[#009E93] dark:text-[#00D2C4]">{formatINR(summary.totalAmount)}</span>
              </div>
            </div>

            {hasMultipleFishermen ? (
              <p className="text-[11px] text-[#52667A] dark:text-[#9DB0C0] text-center leading-relaxed">
                Choose a specific fisherman group on the left to proceed to checkout.
              </p>
            ) : (
              <button
                onClick={() => handleProceedToCheckout(fishermanGroups[0]?.fishermanId || 'platform')}
                className="w-full py-3.5 btn-aqua rounded-xl text-xs font-black shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span>Proceed to Cash on Delivery Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#112233]" />
              </button>
            )}

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#7E92A2] dark:text-[#6B7F91]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00D2C4]" />
              <span>Inspection on delivery • Cash / UPI accepted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
