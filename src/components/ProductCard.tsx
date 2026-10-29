'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, ProductVariant, PreparationOption } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatINR, calculateCartItemPrice, calculateNetYield } from '@/lib/cartUtils';
import { Heart, Plus, Minus, Check, Scissors, Scale, Sparkles, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Selected variant & preparation option
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants[0]
  );
  const [selectedPrep, setSelectedPrep] = useState<PreparationOption | undefined>(
    product.preparation_options.find((p) => p.is_default) || product.preparation_options[0]
  );
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);

  // Check if item is already in cart
  const cartItem = items.find(
    (item) =>
      item.product_id === product.id &&
      item.variant?.id === selectedVariant?.id &&
      item.preparation_option?.id === selectedPrep?.id
  );

  const { unitPrice, cleaningFee } = calculateCartItemPrice(
    product,
    selectedVariant,
    selectedPrep
  );
  const effectivePrice = unitPrice + cleaningFee;

  const grossGrams = selectedVariant ? selectedVariant.weight_grams : 1000;
  const yieldInfo = calculateNetYield(grossGrams, selectedPrep);

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, selectedVariant, selectedPrep, 1);
  };

  return (
    <div className="bg-white dark:bg-[#17232E] rounded-2xl border border-[#DCE5EA] dark:border-[#243444] overflow-hidden flex flex-col card-hover group relative shadow-xs transition-colors duration-200">
      {/* Top Image & Badges */}
      <div className="relative aspect-[4/3] w-full bg-[#EDF3F5] dark:bg-[#121C25] overflow-hidden">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm cursor-pointer ${
            isFavorited
              ? 'bg-rose-500 text-white'
              : 'bg-white/85 dark:bg-[#17232E]/85 text-[#52667A] dark:text-[#9DB0C0] hover:text-rose-500 hover:bg-white dark:hover:bg-[#1F2E3D]'
          }`}
          aria-label="Save to wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Freshness & Bestseller Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {product.freshness === 'fresh_catch' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00D2C4] text-[#112233] shadow-xs">
              <Sparkles className="w-2.5 h-2.5 text-[#112233]" /> Harbor Fresh
            </span>
          )}
          {product.is_bestseller && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-[#112233] shadow-xs">
              Bestseller
            </span>
          )}
        </div>

        {/* Catch Origin Tag */}
        <div className="absolute bottom-2 left-2.5 bg-[#0B131A]/85 backdrop-blur-sm text-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-md border border-white/10">
          Origin: {product.origin_source}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-[#7E92A2] dark:text-[#6B7F91] font-medium mb-1">
            <span className="text-[#009E93] dark:text-[#00D2C4] font-semibold">{product.category_name}</span>
            {product.rating && (
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3 h-3 fill-current" /> {product.rating}
              </span>
            )}
          </div>

          {/* Product Name */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-bold text-[#112233] dark:text-[#EAF2F8] text-base leading-snug group-hover:text-[#00D2C4] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {product.variety_species && (
            <p className="text-[11px] italic text-[#7E92A2] dark:text-[#6B7F91] mt-0.5 truncate">
              {product.variety_species}
            </p>
          )}

          {/* Seller / Fisherman Attribution */}
          {product.seller_name && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#52667A] dark:text-[#9DB0C0] font-medium mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
              <span className="truncate">
                Fisherman: <strong className="text-[#112233] dark:text-[#EAF2F8] font-semibold">{product.seller_name}</strong>
              </span>
            </div>
          )}

          {/* Net weight & cleaning preview */}
          <div className="mt-2.5 p-2 bg-[#EDF3F5] dark:bg-[#121C25] rounded-xl border border-[#DCE5EA] dark:border-[#243444] flex items-center justify-between text-[11px] transition-colors">
            <div className="flex items-center gap-1.5 text-[#52667A] dark:text-[#9DB0C0]">
              <Scale className="w-3.5 h-3.5 text-[#00D2C4] flex-shrink-0" />
              <span>
                Net: <strong className="text-[#112233] dark:text-[#EAF2F8]">{yieldInfo.netGrams}g</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsPrepModalOpen(true)}
              className="text-[#009E93] dark:text-[#00D2C4] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Scissors className="w-3 h-3 text-[#00D2C4]" />
              <span className="max-w-[100px] truncate">{selectedPrep?.name}</span>
            </button>
          </div>

          {/* Variant Selector */}
          {product.variants.length > 1 && (
            <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold border transition-all whitespace-nowrap cursor-pointer ${
                    selectedVariant?.id === v.id
                      ? 'border-[#00D2C4] bg-[#00D2C4]/15 text-[#009E93] dark:text-[#00D2C4] font-bold'
                      : 'border-[#DCE5EA] dark:border-[#243444] text-[#52667A] dark:text-[#9DB0C0] hover:border-[#00D2C4]/40'
                  }`}
                >
                  {v.variant_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price & Add to Cart Footer */}
        <div className="mt-4 pt-3 border-t border-[#DCE5EA] dark:border-[#243444] flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-[#112233] dark:text-[#EAF2F8]">
                {formatINR(effectivePrice)}
              </span>
              {product.discount_price && product.discount_price < product.price_per_unit && (
                <span className="text-xs text-[#7E92A2] dark:text-[#6B7F91] line-through">
                  {formatINR(product.price_per_unit)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#7E92A2] dark:text-[#6B7F91] block -mt-0.5">
              {grossGrams}g Gross
            </span>
          </div>

          {/* Cart Control: Add or Quantity Counter */}
          {cartItem ? (
            <div className="flex items-center bg-[#00D2C4] text-[#112233] rounded-xl overflow-hidden shadow-xs font-bold">
              <button
                type="button"
                onClick={() => updateQuantity(cartItem.id, -1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-[#00B8AC] active:bg-[#009E93] transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center font-black text-xs">
                {cartItem.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(cartItem.id, 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-[#00B8AC] active:bg-[#009E93] transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : !product.is_available || product.stock_quantity <= 0 ? (
            <button
              disabled
              className="px-3 py-1.5 bg-[#EDF3F5] dark:bg-[#1F2E3D] text-[#7E92A2] dark:text-[#6B7F91] rounded-xl text-xs font-semibold cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className="px-3.5 py-1.5 btn-aqua rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-[#112233]" /> Add
            </button>
          )}
        </div>
      </div>

      {/* Preparation Options Modal */}
      {isPrepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#17232E] text-[#112233] dark:text-[#EAF2F8] w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-[#DCE5EA] dark:border-[#243444]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE5EA] dark:border-[#243444]">
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <Scissors className="w-4 h-4 text-[#00D2C4]" />
                <span>Select Preparation Option</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPrepModalOpen(false)}
                className="text-[#7E92A2] dark:text-[#6B7F91] hover:text-[#112233] dark:hover:text-[#EAF2F8] p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] mt-2">
              Seafood is prepared by certified butchers in sanitized facility and packed on gel ice.
            </p>

            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              {product.preparation_options.map((opt) => {
                const isSelected = selectedPrep?.id === opt.id;
                const netYield = calculateNetYield(grossGrams, opt);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedPrep(opt);
                      setIsPrepModalOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#00D2C4] bg-[#00D2C4]/15 font-semibold text-[#112233] dark:text-[#EAF2F8]'
                        : 'border-[#DCE5EA] dark:border-[#243444] hover:border-[#00D2C4]/40 bg-[#F8FAFA] dark:bg-[#121C25]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[#112233] dark:text-[#EAF2F8]">{opt.name}</div>
                      <div className="text-[11px] text-[#52667A] dark:text-[#9DB0C0] mt-0.5 leading-tight">
                        {opt.description}
                      </div>
                      <div className="text-[10px] text-[#009E93] dark:text-[#00D2C4] font-medium mt-1">
                        Est. Net Yield: ~{netYield.netGrams}g (waste removed ~{netYield.lossGrams}g)
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="block text-xs font-bold text-[#112233] dark:text-[#EAF2F8]">
                        {opt.extra_price > 0 ? `+${formatINR(opt.extra_price)}` : 'FREE'}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#00D2C4] ml-auto mt-1" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
