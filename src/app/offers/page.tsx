import React from 'react';
import { dbService } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import { Tag, Sparkles } from 'lucide-react';
import CouponCopyCard from './CouponCopyCard';

export default async function OffersPage() {
  const coupons = await dbService.getCoupons();
  const allProducts = await dbService.getProducts();
  const discountedProducts = allProducts.filter(
    (p) => p.discount_price && p.discount_price < p.price_per_unit
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0E3B43] via-[#0B2E35] to-[#0B131A] rounded-3xl p-8 sm:p-12 text-white shadow-xl border border-[#00D2C4]/30">
        <div className="max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00D2C4]/20 border border-[#00D2C4]/40 text-[#00D2C4] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#00D2C4]" /> Special Promotions
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Fresh Catch Deals & Coupons
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Save on premium river fish, jumbo tiger prawns, and coastal crabs with active coupon codes and today's promotional pricing.
          </p>
        </div>
      </div>

      {/* Coupons Grid */}
      <section>
        <h2 className="text-xl sm:text-2xl font-black text-[#112233] dark:text-[#EAF2F8] tracking-tight mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-[#00D2C4]" />
          <span>Active Promo Coupons</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coupons.map((c) => (
            <CouponCopyCard key={c.id} coupon={c} />
          ))}
        </div>
      </section>

      {/* Discounted Seafood Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[#112233] dark:text-[#EAF2F8] tracking-tight">
            Discounted Fresh Catches
          </h2>
          <span className="text-xs text-[#52667A] dark:text-[#9DB0C0] font-medium">
            {discountedProducts.length} catches on discount
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {discountedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
