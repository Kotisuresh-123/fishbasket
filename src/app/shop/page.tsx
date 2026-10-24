import React from 'react';
import Link from 'next/link';
import { dbService } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import { Filter, SlidersHorizontal, Sparkles } from 'lucide-react';

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    freshness?: string;
    sort?: 'price_asc' | 'price_desc' | 'rating';
    minPrice?: string;
    maxPrice?: string;
    q?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const categories = await dbService.getCategories();

  const minP = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxP = params.maxPrice ? parseFloat(params.maxPrice) : undefined;

  const products = await dbService.getProducts({
    categorySlug: params.category,
    freshness: params.freshness,
    sort: params.sort,
    minPrice: minP,
    maxPrice: maxP,
    search: params.q,
  });

  const activeCategory = categories.find((c) => c.slug === params.category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <Link href="/" className="hover:text-teal-600">Home</Link>
          <span>/</span>
          <span className="text-slate-700 font-semibold">
            {activeCategory ? activeCategory.name : 'All Seafood'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {activeCategory ? activeCategory.name : 'Fresh Seafood Catalog'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing {products.length} catches • Sourced daily • Chemical & Formalin-Free
            </p>
          </div>

          {/* Quick Sort Links */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <Link
              href={`/shop?${new URLSearchParams({ ...params, sort: 'price_asc' }).toString()}`}
              className={`px-3 py-1.5 rounded-lg border font-semibold ${
                params.sort === 'price_asc'
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Price: Low to High
            </Link>
            <Link
              href={`/shop?${new URLSearchParams({ ...params, sort: 'price_desc' }).toString()}`}
              className={`px-3 py-1.5 rounded-lg border font-semibold ${
                params.sort === 'price_desc'
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Price: High to Low
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-teal-600" /> Filters
              </span>
              {(params.category || params.freshness || params.sort || params.minPrice || params.maxPrice) && (
                <Link
                  href="/shop"
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                >
                  Clear All
                </Link>
              )}
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Seafood Categories
              </h4>
              <div className="space-y-1 text-xs">
                <Link
                  href="/shop"
                  className={`block px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                    !params.category
                      ? 'bg-teal-50 text-teal-800 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/shop?category=${c.slug}`}
                    className={`block px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                      params.category === c.slug
                        ? 'bg-teal-50 text-teal-800 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Freshness Classification */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Freshness
              </h4>
              <div className="space-y-1.5 text-xs">
                <Link
                  href={`/shop?${new URLSearchParams({ ...params, freshness: 'fresh_catch' }).toString()}`}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${
                    params.freshness === 'fresh_catch'
                      ? 'bg-teal-50 text-teal-800 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Fresh Catch (Morning Netting)</span>
                </Link>
                <Link
                  href={`/shop?${new URLSearchParams({ ...params, freshness: 'chilled' }).toString()}`}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${
                    params.freshness === 'chilled'
                      ? 'bg-teal-50 text-teal-800 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Chilled (Deep Sea Harvest)</span>
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Products Catalog Grid */}
        <main className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">No seafood matches your filters</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try selecting a different category or clearing your active filters to see all available harbor catches.
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-block px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl"
              >
                Reset Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
