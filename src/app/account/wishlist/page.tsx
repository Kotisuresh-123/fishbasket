'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { Heart } from 'lucide-react';
import { INITIAL_PRODUCTS } from '@/data/mockData';

export default function WishlistPage() {
  const { wishlistIds } = useWishlist();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Match against mock catalog
    const matched = INITIAL_PRODUCTS.filter((p) => wishlistIds.includes(p.id));
    setWishlistProducts(matched);
  }, [wishlistIds]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Saved Seafood Wishlist</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Your favorite fish, prawns, and crabs bookmarked for quick ordering
        </p>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Heart className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">Your wishlist is empty</h3>
          <p className="text-xs text-slate-400">
            Click the heart icon on any product to save it to your wishlist.
          </p>
          <Link
            href="/shop"
            className="inline-block mt-2 px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl"
          >
            Explore Fresh Catches
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
