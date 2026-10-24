import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dbService } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import { ChevronRight } from 'lucide-react';

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
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
        <Link href="/" className="hover:text-teal-600">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-teal-600">Categories</Link>
        <span>/</span>
        <span className="text-slate-700 font-semibold">{category.name}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-10 text-white mb-10 shadow-lg">
        <div className="max-w-2xl">
          <span className="text-teal-400 text-xs font-bold uppercase tracking-wider block mb-1">
            Seafood Category
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{category.name}</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            {category.description}
          </p>
          <div className="mt-4 text-xs font-semibold text-teal-200">
            {products.length} {products.length === 1 ? 'catch available' : 'catches available'}
          </div>
        </div>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-sm font-semibold">
            No catches currently listed in {category.name} today.
          </p>
          <Link
            href="/shop"
            className="mt-3 inline-block px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl"
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
