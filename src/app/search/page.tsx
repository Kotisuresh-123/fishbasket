import React from 'react';
import Link from 'next/link';
import { dbService } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import { Search } from 'lucide-react';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || '';

  const products = query ? await dbService.getProducts({ search: query }) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Search Header */}
      <div className="mb-8 max-w-2xl">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <Link href="/" className="hover:text-teal-600">Home</Link>
          <span>/</span>
          <span className="text-slate-700 font-semibold">Search</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Search Seafood
        </h1>
        {query ? (
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Found {products.length} {products.length === 1 ? 'match' : 'matches'} for &ldquo;<span className="font-semibold text-slate-800">{query}</span>&rdquo;
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Type product name, fish species, or category to find fresh catches.
          </p>
        )}
      </div>

      {/* Results */}
      {products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No catches found</h3>
          <p className="text-xs text-slate-500 mt-1">
            We couldn&apos;t find any seafood matching &ldquo;{query}&rdquo;. Check spelling or explore our fresh catches.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
              href="/category/freshwater-fish"
              className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 rounded-xl text-xs font-semibold"
            >
              Freshwater Fish
            </Link>
            <Link
              href="/category/sea-fish"
              className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 rounded-xl text-xs font-semibold"
            >
              Sea Fish
            </Link>
            <Link
              href="/category/prawns"
              className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 rounded-xl text-xs font-semibold"
            >
              Prawns
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
