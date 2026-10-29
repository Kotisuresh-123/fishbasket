'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product, ProductVariant, PreparationOption } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatINR, calculateCartItemPrice, calculateNetYield } from '@/lib/cartUtils';
import {
  Heart,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Scissors,
  Scale,
  Sparkles,
  Star,
  Anchor,
} from 'lucide-react';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants[0]
  );
  const [selectedPrep, setSelectedPrep] = useState<PreparationOption | undefined>(
    product.preparation_options.find((p) => p.is_default) || product.preparation_options[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const isFavorited = isInWishlist(product.id);

  const { singleItemTotal } = calculateCartItemPrice(
    product,
    selectedVariant,
    selectedPrep
  );
  const effectiveTotal = singleItemTotal * quantity;

  const grossGrams = selectedVariant ? selectedVariant.weight_grams : 1000;
  const yieldInfo = calculateNetYield(grossGrams, selectedPrep);

  const handleAddToCart = () => {
    addItem(product, selectedVariant, selectedPrep, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Left: Product Image & Badges */}
      <div className="lg:col-span-6 space-y-4">
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[#EDF3F5] dark:bg-[#121C25] border border-[#DCE5EA] dark:border-[#243444] shadow-md transition-colors">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            priority
            className="object-cover"
          />

          {/* Freshness Badge */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            {product.freshness === 'fresh_catch' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#00D2C4] text-[#112233] shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-[#112233]" /> Harbor Fresh Catch
              </span>
            )}
            {product.is_bestseller && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-[#112233] shadow-md">
                Bestseller
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md shadow-md transition-all cursor-pointer ${
              isFavorited
                ? 'bg-rose-500 text-white'
                : 'bg-white/85 dark:bg-[#17232E]/85 text-[#52667A] dark:text-[#9DB0C0] hover:text-rose-500 hover:bg-white dark:hover:bg-[#1F2E3D]'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>

          {/* Origin Badge */}
          <div className="absolute bottom-4 left-4 bg-[#0B131A]/85 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-xl border border-white/10">
            Harvest Source: {product.origin_source}
          </div>
        </div>
      </div>

      {/* Right: Purchasing Controls, Variants, Prep options */}
      <div className="lg:col-span-6 space-y-6">
        <div>
          <span className="text-xs font-bold text-[#009E93] dark:text-[#00D2C4] uppercase tracking-wider">
            {product.category_name}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#112233] dark:text-[#EAF2F8] tracking-tight mt-1">
            {product.name}
          </h1>
          {product.variety_species && (
            <p className="text-xs italic text-[#7E92A2] dark:text-[#6B7F91] mt-1">
              Species: {product.variety_species}
            </p>
          )}

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-[#112233] dark:text-[#EAF2F8]">{product.rating}</span>
              <span className="text-xs text-[#7E92A2] dark:text-[#6B7F91]">
                ({product.review_count || 120} verified customer ratings)
              </span>
            </div>
          )}

          {/* Fisherman Seller Attribution */}
          {product.seller_name && (
            <div className="mt-3.5 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                  <Anchor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 tracking-wider">
                    Fisherman
                  </div>
                  <div className="text-xs font-bold text-[#112233] dark:text-[#EAF2F8]">
                    {product.seller_name}
                  </div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-white dark:bg-[#17232E] text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/30 rounded-md shadow-xs">
                Verified Fisherman
              </span>
            </div>
          )}
        </div>

        {/* Price Display */}
        <div className="p-4 rounded-2xl bg-[#EDF3F5] dark:bg-[#121C25] border border-[#DCE5EA] dark:border-[#243444] flex items-baseline justify-between transition-colors">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#112233] dark:text-[#EAF2F8]">
                {formatINR(singleItemTotal)}
              </span>
              {product.discount_price && product.discount_price < product.price_per_unit && (
                <span className="text-sm text-[#7E92A2] dark:text-[#6B7F91] line-through">
                  {formatINR(product.price_per_unit)}
                </span>
              )}
            </div>
            <span className="text-xs text-[#52667A] dark:text-[#9DB0C0] mt-0.5 block">
              Inclusive of all seafood preparation & packaging charges
            </span>
          </div>

          <div className="text-right">
            <span className="inline-block px-2.5 py-1 bg-[#00D2C4]/20 text-[#009E93] dark:text-[#00D2C4] font-bold text-xs rounded-xl border border-[#00D2C4]/30">
              In Stock & Ready
            </span>
          </div>
        </div>

        {/* 1. Weight Variant Selector */}
        {product.variants.length > 0 && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#52667A] dark:text-[#9DB0C0] mb-2">
              Select Package Weight
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#00D2C4] bg-[#00D2C4]/15 text-[#009E93] dark:text-[#00D2C4] font-bold shadow-xs'
                        : 'border-[#DCE5EA] dark:border-[#243444] bg-white dark:bg-[#17232E] text-[#52667A] dark:text-[#9DB0C0] hover:border-[#00D2C4]/40'
                    }`}
                  >
                    <div className="text-xs">{v.variant_name}</div>
                    <div className="text-xs text-[#7E92A2] dark:text-[#6B7F91] font-semibold mt-0.5">
                      {formatINR(v.discount_price ?? v.price)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Preparation & Cutting Options */}
        {product.preparation_options.length > 0 && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#52667A] dark:text-[#9DB0C0] mb-2">
              Choose Preparation & Cut
            </label>
            <div className="space-y-2">
              {product.preparation_options.map((opt) => {
                const isSelected = selectedPrep?.id === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedPrep(opt)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#00D2C4] bg-[#00D2C4]/15 font-semibold text-[#112233] dark:text-[#EAF2F8] shadow-xs'
                        : 'border-[#DCE5EA] dark:border-[#243444] bg-[#F8FAFA] dark:bg-[#121C25] hover:border-[#00D2C4]/40 text-[#52667A] dark:text-[#9DB0C0]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-[#112233] dark:text-[#EAF2F8] flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5 text-[#00D2C4]" />
                        <span>{opt.name}</span>
                      </div>
                      <div className="text-[11px] text-[#52667A] dark:text-[#9DB0C0] mt-0.5">
                        {opt.description}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <span className="text-xs font-bold text-[#112233] dark:text-[#EAF2F8]">
                        {opt.extra_price > 0 ? `+${formatINR(opt.extra_price)}` : 'FREE'}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#00D2C4] ml-auto mt-1" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Weight Transparency Breakdown (Gross vs Net Yield) */}
        <div className="p-4 bg-[#00D2C4]/10 dark:bg-[#00D2C4]/15 rounded-2xl border border-[#00D2C4]/30 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-[#009E93] dark:text-[#00D2C4]">
            <Scale className="w-4 h-4 text-[#00D2C4]" />
            <span>Weight Transparency & Yield Policy</span>
          </div>
          <div className="flex justify-between text-[#52667A] dark:text-[#9DB0C0]">
            <span>Gross Raw Weight:</span>
            <span className="font-semibold text-[#112233] dark:text-[#EAF2F8]">{grossGrams}g</span>
          </div>
          <div className="flex justify-between text-[#52667A] dark:text-[#9DB0C0]">
            <span>Inedible Waste Removed (Scales, Gills, Viscera):</span>
            <span className="font-semibold text-rose-500">
              ~{yieldInfo.lossGrams}g ({yieldInfo.lossPercent}%)
            </span>
          </div>
          <div className="flex justify-between text-[#112233] dark:text-[#EAF2F8] font-bold pt-1 border-t border-[#00D2C4]/30">
            <span>Estimated Cleaned Net Weight:</span>
            <span className="text-[#009E93] dark:text-[#00D2C4] text-sm font-black">~{yieldInfo.netGrams}g Ready to Cook</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#52667A] dark:text-[#9DB0C0] mb-1.5">
            About This Catch
          </h4>
          <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Add to Cart Actions */}
        <div className="pt-4 border-t border-[#DCE5EA] dark:border-[#243444] flex items-center gap-3">
          {/* Quantity Counter */}
          <div className="flex items-center bg-[#EDF3F5] dark:bg-[#121C25] rounded-xl overflow-hidden border border-[#DCE5EA] dark:border-[#243444]">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-[#1F2E3D] text-[#112233] dark:text-[#EAF2F8] transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-black text-[#112233] dark:text-[#EAF2F8]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-[#1F2E3D] text-[#112233] dark:text-[#EAF2F8] transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button: Bright Aqua #00D2C4 */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-3 px-6 btn-aqua rounded-xl font-black text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-98"
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 text-[#112233]" />
                <span className="text-[#112233]">Added to Basket!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 text-[#112233]" />
                <span className="text-[#112233]">
                  Add {quantity > 1 ? `${quantity} Packs` : 'to Basket'} • {formatINR(effectiveTotal)}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
