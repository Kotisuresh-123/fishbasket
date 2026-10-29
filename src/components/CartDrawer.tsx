'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatINR } from '@/lib/cartUtils';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
  Tag,
  Check,
  Scissors,
  Anchor,
  AlertCircle,
} from 'lucide-react';

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    summary,
    coupon,
    applyCoupon,
    removeCoupon,
    fishermanGroups,
    hasMultipleFishermen,
    setSelectedCheckoutFishermanId,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);

    const result = await applyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);
    if (!result.success) {
      setCouponError(result.message);
    } else {
      setCouponInput('');
    }
  };

  const handleCheckoutFisherman = (fishermanId: string) => {
    setSelectedCheckoutFishermanId(fishermanId);
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#17232E] text-[#112233] dark:text-[#EAF2F8] shadow-2xl flex flex-col border-l border-[#DCE5EA] dark:border-[#243444] animate-in slide-in-from-right duration-250 transition-colors">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#DCE5EA] dark:border-[#243444] flex items-center justify-between bg-[#F8FAFA] dark:bg-[#121C25] transition-colors">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#00D2C4]" />
              <h2 className="text-base font-bold text-[#112233] dark:text-[#EAF2F8]">Your Fresh Basket</h2>
              <span className="text-xs bg-[#00D2C4]/20 text-[#009E93] dark:text-[#00D2C4] font-bold px-2 py-0.5 rounded-full border border-[#00D2C4]/30">
                {summary.itemsCount} {summary.itemsCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-[#1F2E3D] text-[#7E92A2] dark:text-[#6B7F91] hover:text-[#112233] dark:hover:text-[#EAF2F8] transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Multiple Fishermen Explanation Alert */}
          {hasMultipleFishermen && (
            <div className="p-3 bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold">Multi-Fisherman Basket Notice:</span>
                <p className="text-[11px] leading-snug text-amber-800 dark:text-amber-300">
                  Your basket contains catches from {fishermanGroups.length} different fishermen. Per marketplace policy, checkout is completed with one fisherman at a time.
                </p>
              </div>
            </div>
          )}

          {/* Items List Grouped by Fisherman */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#7E92A2] dark:text-[#6B7F91]">
                <div className="w-16 h-16 rounded-2xl bg-[#EDF3F5] dark:bg-[#121C25] flex items-center justify-center mb-4 text-[#7E92A2] dark:text-[#6B7F91]">
                  <ShoppingBag className="w-8 h-8 text-[#00D2C4]" />
                </div>
                <p className="font-bold text-[#112233] dark:text-[#EAF2F8] text-base">Your basket is empty</p>
                <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] max-w-xs mt-1">
                  Explore today&apos;s morning catch directly from fishing harbors and add your favorite fish and prawns.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push('/shop');
                  }}
                  className="mt-5 px-5 py-2.5 btn-aqua rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Explore Fresh Catches
                </button>
              </div>
            ) : (
              fishermanGroups.map((group) => (
                <div
                  key={group.fishermanId}
                  className="bg-[#F8FAFA] dark:bg-[#121C25] border border-[#DCE5EA] dark:border-[#243444] rounded-2xl p-3.5 space-y-3 transition-colors"
                >
                  {/* Seller Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#DCE5EA] dark:border-[#243444]">
                    <div className="flex items-center gap-1.5">
                      <Anchor className="w-3.5 h-3.5 text-[#00D2C4] flex-shrink-0" />
                      <span className="font-bold text-xs text-[#112233] dark:text-[#EAF2F8] truncate">
                        {group.sellerName}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#52667A] dark:text-[#9DB0C0] font-semibold">
                      {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Items for this seller */}
                  <div className="space-y-3 divide-y divide-[#DCE5EA] dark:divide-[#243444]">
                    {group.items.map((item) => (
                      <div key={item.id} className="pt-2 first:pt-0 flex gap-2.5">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#EDF3F5] dark:bg-[#1F2E3D] flex-shrink-0 border border-[#DCE5EA] dark:border-[#243444]">
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-bold text-xs text-[#112233] dark:text-[#EAF2F8] truncate">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-[#7E92A2] dark:text-[#6B7F91] hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-[10px] text-[#52667A] dark:text-[#9DB0C0] space-y-0.5">
                            {item.variant && <div>{item.variant.variant_name}</div>}
                            {item.preparation_option && (
                              <div className="flex items-center gap-1 text-[#009E93] dark:text-[#00D2C4]">
                                <Scissors className="w-2.5 h-2.5" />
                                <span>{item.preparation_option.name}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-1.5">
                            <div className="font-black text-xs text-[#112233] dark:text-[#EAF2F8]">
                              {formatINR(item.item_total)}
                            </div>

                            <div className="flex items-center bg-white dark:bg-[#17232E] rounded-lg overflow-hidden border border-[#DCE5EA] dark:border-[#243444] shadow-xs">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#1F2E3D] text-[#112233] dark:text-[#EAF2F8] transition-colors cursor-pointer"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="w-5 text-center text-[11px] font-bold text-[#112233] dark:text-[#EAF2F8]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-[#1F2E3D] text-[#112233] dark:text-[#EAF2F8] transition-colors cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Group checkout CTA if multiple sellers exist */}
                  {hasMultipleFishermen && (
                    <div className="pt-2 border-t border-[#DCE5EA] dark:border-[#243444] flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-[10px] text-[#7E92A2] dark:text-[#6B7F91] block">Subtotal</span>
                        <strong className="text-[#112233] dark:text-[#EAF2F8] font-black">{formatINR(group.subtotal)}</strong>
                      </div>
                      <button
                        onClick={() => handleCheckoutFisherman(group.fishermanId)}
                        className="px-3 py-1.5 btn-aqua font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      >
                        <span>Checkout This Catch</span>
                        <ArrowRight className="w-3 h-3 text-[#112233]" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer with Single Checkout CTA if 1 seller */}
          {items.length > 0 && !hasMultipleFishermen && (
            <div className="p-4 sm:p-5 border-t border-[#DCE5EA] dark:border-[#243444] bg-[#F8FAFA] dark:bg-[#121C25] space-y-3 transition-colors">
              {coupon ? (
                <div className="flex items-center justify-between bg-[#00D2C4]/15 border border-[#00D2C4]/35 rounded-xl p-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#009E93] dark:text-[#00D2C4]" />
                    <div>
                      <span className="font-bold text-[#009E93] dark:text-[#00D2C4]">{coupon.code}</span>
                      <span className="text-[#52667A] dark:text-[#9DB0C0] block text-[10px]">Saved {formatINR(summary.discountAmount)}</span>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600 underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter Coupon (e.g. FRESH100)"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#DCE5EA] dark:border-[#243444] uppercase bg-white dark:bg-[#17232E] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:border-[#00D2C4] font-semibold placeholder:text-[#7E92A2] dark:placeholder:text-[#6B7F91]"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingCoupon}
                    className="px-4 py-2 bg-[#112233] hover:bg-[#1A334D] text-white dark:bg-[#1F2E3D] dark:hover:bg-[#2A3F53] font-bold text-xs rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isApplyingCoupon ? '...' : 'Apply'}
                  </button>
                </form>
              )}

              {couponError && <p className="text-xs text-rose-500 font-medium">{couponError}</p>}

              <div className="space-y-1.5 text-xs pt-1">
                <div className="flex justify-between text-[#52667A] dark:text-[#9DB0C0]">
                  <span>Subtotal</span>
                  <span className="text-[#112233] dark:text-[#EAF2F8] font-semibold">{formatINR(summary.subtotal)}</span>
                </div>
                {summary.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount</span>
                    <span>-{formatINR(summary.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#52667A] dark:text-[#9DB0C0]">
                  <span>Cold-Chain Delivery</span>
                  <span className="text-[#112233] dark:text-[#EAF2F8] font-semibold">{summary.deliveryFee === 0 ? 'FREE' : formatINR(summary.deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-[#112233] dark:text-[#EAF2F8] pt-2 border-t border-[#DCE5EA] dark:border-[#243444]">
                  <span>Total Amount (COD)</span>
                  <span className="text-[#009E93] dark:text-[#00D2C4]">{formatINR(summary.totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={() => handleCheckoutFisherman(fishermanGroups[0]?.fishermanId || 'platform')}
                className="w-full py-3.5 btn-aqua rounded-xl text-xs font-black shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span>Proceed to Cash on Delivery Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#112233]" />
              </button>
            </div>
          )}

          {/* Footer view if multiple sellers */}
          {items.length > 0 && hasMultipleFishermen && (
            <div className="p-4 border-t border-[#DCE5EA] dark:border-[#243444] bg-[#F8FAFA] dark:bg-[#121C25] text-center">
              <Link
                href="/cart"
                onClick={() => setIsCartOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#009E93] dark:text-[#00D2C4] hover:underline"
              >
                <span>View Full Multi-Fisherman Basket Details</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#00D2C4]" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
