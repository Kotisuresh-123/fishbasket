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
        <div className="flex items-center gap-2 text-xs text-[#7E92A2] dark:text-[#6B7F91] mb-2">
          <Link href="/" className="hover:text-[#00D2C4] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#112233] dark:text-[#EAF2F8] font-semibold">Search</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#112233] dark:text-[#EAF2F8] tracking-tight">
          Search Seafood
        </h1>
        {query ? (
          <p className="text-xs sm:text-sm text-[#52667A] dark:text-[#9DB0C0] mt-1">
            Found {products.length} {products.length === 1 ? 'match' : 'matches'} for &ldquo;<span className="font-bold text-[#009E93] dark:text-[#00D2C4]">{query}</span>&rdquo;
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-[#52667A] dark:text-[#9DB0C0] mt-1">
            Type product name, fish species, or category to find fresh catches.
          </p>
        )}
      </div>

      {/* Results */}
      {products.length === 0 ? (
        <div className="bg-white dark:bg-[#17232E] rounded-3xl border border-[#DCE5EA] dark:border-[#243444] p-12 text-center max-w-lg mx-auto shadow-xs transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-[#EDF3F5] dark:bg-[#121C25] text-[#7E92A2] dark:text-[#6B7F91] flex items-center justify-center mx-auto mb-3 border border-[#DCE5EA] dark:border-[#243444]">
            <Search className="w-7 h-7 text-[#00D2C4]" />
          </div>
          <h3 className="font-bold text-[#112233] dark:text-[#EAF2F8] text-base">No catches found</h3>
          <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] mt-1">
            We couldn&apos;t find any seafood matching &ldquo;{query}&rdquo;. Check spelling or explore our fresh catches.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
              href="/category/freshwater-fish"
              className="px-3.5 py-1.5 bg-[#EDF3F5] dark:bg-[#121C25] hover:bg-[#00D2C4]/15 text-[#112233] dark:text-[#EAF2F8] hover:text-[#00D2C4] rounded-xl text-xs font-semibold transition-colors border border-[#DCE5EA] dark:border-[#243444]"
            >
              Freshwater Fish
            </Link>
            <Link
              href="/category/sea-fish"
              className="px-3.5 py-1.5 bg-[#EDF3F5] dark:bg-[#121C25] hover:bg-[#00D2C4]/15 text-[#112233] dark:text-[#EAF2F8] hover:text-[#00D2C4] rounded-xl text-xs font-semibold transition-colors border border-[#DCE5EA] dark:border-[#243444]"
            >
              Sea Fish
            </Link>
            <Link
              href="/category/prawns"
              className="px-3.5 py-1.5 bg-[#EDF3F5] dark:bg-[#121C25] hover:bg-[#00D2C4]/15 text-[#112233] dark:text-[#EAF2F8] hover:text-[#00D2C4] rounded-xl text-xs font-semibold transition-colors border border-[#DCE5EA] dark:border-[#243444]"
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
