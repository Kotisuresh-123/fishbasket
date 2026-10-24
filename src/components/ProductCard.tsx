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
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col card-hover group relative">
      {/* Top Image & Badges */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
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
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm ${
            isFavorited
              ? 'bg-rose-500 text-white'
              : 'bg-white/85 text-slate-600 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label="Save to wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Freshness Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {product.freshness === 'fresh_catch' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-600 text-white shadow-sm">
              <Sparkles className="w-2.5 h-2.5" /> Harbor Fresh
            </span>
          )}
          {product.is_bestseller && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-sm">
              Bestseller
            </span>
          )}
        </div>

        {/* Catch Origin Tag */}
        <div className="absolute bottom-2 left-2.5 bg-slate-900/80 backdrop-blur-sm text-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-md">
          Origin: {product.origin_source}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Species */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span className="text-teal-700 font-semibold">{product.category_name}</span>
            {product.rating && (
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3 h-3 fill-current" /> {product.rating}
              </span>
            )}
          </div>

          {/* Product Name */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-teal-700 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {product.variety_species && (
            <p className="text-[11px] italic text-slate-400 mt-0.5 truncate">
              {product.variety_species}
            </p>
          )}

          {/* Seller / Fisherman Attribution */}
          {product.seller_name && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="truncate">Fisherman: <strong className="text-slate-700 font-semibold">{product.seller_name}</strong></span>
            </div>
          )}

          {/* Net weight & cleaning preview */}
          <div className="mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Scale className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
              <span>
                Net: <strong className="text-slate-800">{yieldInfo.netGrams}g</strong>
              </span>
            </div>
            <button
              onClick={() => setIsPrepModalOpen(true)}
              className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
            >
              <Scissors className="w-3 h-3" />
              <span className="max-w-[100px] truncate">{selectedPrep?.name}</span>
            </button>
          </div>

          {/* Variant Selector (if multiple) */}
          {product.variants.length > 1 && (
            <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold border transition-all whitespace-nowrap ${
                    selectedVariant?.id === v.id
                      ? 'border-teal-600 bg-teal-50 text-teal-800'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {v.variant_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price & Add to Cart Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900">
                {formatINR(effectivePrice)}
              </span>
              {product.discount_price && product.discount_price < product.price_per_unit && (
                <span className="text-xs text-slate-400 line-through">
                  {formatINR(product.price_per_unit)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 block -mt-0.5">
              {grossGrams}g Gross
            </span>
          </div>

          {/* Cart Control: Add or Quantity Counter */}
          {cartItem ? (
            <div className="flex items-center bg-teal-700 text-white rounded-xl overflow-hidden shadow-xs">
              <button
                onClick={() => updateQuantity(cartItem.id, -1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-teal-800 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center font-bold text-xs">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => updateQuantity(cartItem.id, 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-teal-800 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : !product.is_available || product.stock_quantity <= 0 ? (
            <button
              disabled
              className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-semibold cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          )}
        </div>
      </div>

      {/* Preparation Options Modal */}
      {isPrepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-100 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                <Scissors className="w-4 h-4 text-teal-600" />
                <span>Select Preparation Option</span>
              </div>
              <button
                onClick={() => setIsPrepModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Seafood is prepared by certified butchers in sanitized facility and packed on gel ice.
            </p>

            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              {product.preparation_options.map((opt) => {
                const isSelected = selectedPrep?.id === opt.id;
                const netYield = calculateNetYield(grossGrams, opt);
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSelectedPrep(opt);
                      setIsPrepModalOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/70 font-semibold'
                        : 'border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{opt.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                        {opt.description}
                      </div>
                      <div className="text-[10px] text-teal-700 font-medium mt-1">
                        Est. Net Yield: ~{netYield.netGrams}g (waste removed ~{netYield.lossGrams}g)
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="block text-xs font-bold text-slate-800">
                        {opt.extra_price > 0 ? `+${formatINR(opt.extra_price)}` : 'FREE'}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-teal-600 ml-auto mt-1" />}
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
