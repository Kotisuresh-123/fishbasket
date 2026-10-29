import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dbService } from '@/lib/db';
import ProductCard from '@/components/ProductCard';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await dbService.getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await dbService.getProducts({ categorySlug: slug });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-[#7E92A2] dark:text-[#6B7F91] mb-4">
        <Link href="/" className="hover:text-[#00D2C4] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[#00D2C4] transition-colors">Categories</Link>
        <span>/</span>
        <span className="text-[#112233] dark:text-[#EAF2F8] font-semibold">{category.name}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0E3B43] via-[#0B2E35] to-[#0B131A] rounded-3xl p-6 sm:p-10 text-white mb-10 shadow-xl border border-[#00D2C4]/30">
        <div className="max-w-2xl">
          <span className="text-[#00D2C4] text-xs font-bold uppercase tracking-wider block mb-1">
            Seafood Category
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{category.name}</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            {category.description}
          </p>
          <div className="mt-4 text-xs font-bold text-[#00D2C4] inline-block px-3 py-1 bg-[#00D2C4]/15 rounded-full border border-[#00D2C4]/30">
            {products.length} {products.length === 1 ? 'catch available' : 'catches available'}
          </div>
        </div>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#17232E] rounded-2xl border border-[#DCE5EA] dark:border-[#243444] transition-colors">
          <p className="text-[#52667A] dark:text-[#9DB0C0] text-sm font-semibold">
            No catches currently listed in {category.name} today.
          </p>
          <Link
            href="/shop"
            className="mt-3 inline-block px-4 py-2 btn-aqua text-xs font-bold rounded-xl shadow-xs"
          >
            Explore All Seafood
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
