import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { dbService } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import NewsletterForm from '@/components/NewsletterForm';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Scissors,
  CheckCircle2,
  Star,
  ChevronRight,
  Mail,
} from 'lucide-react';

export default async function HomePage() {
  const categories = await dbService.getCategories();
  const allProducts = await dbService.getProducts();

  const freshCatchProducts = allProducts.filter((p) => p.freshness === 'fresh_catch').slice(0, 4);
  const bestSellers = allProducts.filter((p) => p.is_bestseller).slice(0, 4);
  const comboProducts = allProducts.filter((p) => p.category_slug === 'seafood-combos');
  const reviews = await dbService.getReviews();

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-[#0B131A] via-[#121C25] to-[#0A1820] text-white overflow-hidden py-14 sm:py-20 lg:py-24 border-b border-[#1E2D3B]">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D2C4]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00D2C4]/15 border border-[#00D2C4]/35 text-[#00D2C4] text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#00D2C4]" />
                <span>Today's Morning Netting • Zero Formalin</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
                Fresh Seafood, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D2C4] via-[#38E3D8] to-emerald-300">
                  Delivered to Your Door.
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed font-normal">
                Explore fresh fish, prawns, crabs and more, prepared the way you like. Sourced daily from harbor trawlers, cleaned with care, and delivered chilled with gel ice.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/shop"
                  className="px-7 py-3.5 btn-aqua rounded-xl text-sm sm:text-base font-black shadow-lg hover:shadow-[#00D2C4]/30 flex items-center gap-2 group active:scale-95 transition-all"
                >
                  <span>Shop Fresh Catch</span>
                  <ArrowRight className="w-4 h-4 text-[#112233] group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/shop"
                  className="px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm sm:text-base rounded-xl border border-white/20 transition-colors"
                >
                  Explore Seafood
                </Link>
              </div>

              {/* Highlights row */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-[#00D2C4] flex-shrink-0" />
                  <span>100% Chemical Free</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Scissors className="w-4 h-4 text-[#00D2C4] flex-shrink-0" />
                  <span>Curry & Fry Cut Options</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Truck className="w-4 h-4 text-[#00D2C4] flex-shrink-0" />
                  <span>Chilled In 120 Mins</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border-2 border-white/15 shadow-2xl bg-slate-900">
                <Image
                  src="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=80"
                  alt="Fresh Pomfret and Seafood Slices"
                  fill
                  priority
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                {/* Floating highlight badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#17232E]/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00D2C4] block">
                      Featured Morning Catch
                    </span>
                    <span className="font-bold text-sm text-white">
                      Indian White Pomfret (Paplet)
                    </span>
                    <span className="text-xs text-slate-300 block">From ₹419 / 500g</span>
                  </div>
                  <Link
                    href="/product/white-pomfret"
                    className="px-3.5 py-1.5 btn-aqua rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    View Cut
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY NAVIGATION GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#009E93] dark:text-[#00D2C4]">
              Freshwater, Sea & Crustaceans
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#112233] dark:text-[#EAF2F8] tracking-tight mt-1">
              Explore by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-[#009E93] dark:text-[#00D2C4] hover:underline font-bold text-sm flex items-center gap-1 group"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative bg-white dark:bg-[#17232E] rounded-2xl border border-[#DCE5EA] dark:border-[#243444] overflow-hidden card-hover shadow-xs transition-colors"
            >
              <div className="relative aspect-[4/3] w-full bg-[#EDF3F5] dark:bg-[#121C25] overflow-hidden">
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover group-hover:scale-108 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-base leading-tight group-hover:text-[#00D2C4] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5 opacity-90">
                    {cat.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. TODAY'S FRESH CATCH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#009E93] dark:text-[#00D2C4]">
              <Sparkles className="w-3.5 h-3.5 text-[#00D2C4]" />
              <span>Harbor Direct Netting</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#112233] dark:text-[#EAF2F8] tracking-tight mt-1">
              Today's Fresh Catch
            </h2>
          </div>
          <Link
            href="/shop?freshness=fresh_catch"
            className="text-[#009E93] dark:text-[#00D2C4] hover:underline font-bold text-sm flex items-center gap-1 group"
          >
            <span>Browse All Catch</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {freshCatchProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. PROMOTIONAL FLASH BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-[#0E3B43] via-[#0B2E35] to-[#0B131A] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl border border-[#00D2C4]/30">
          <div className="relative z-10 max-w-xl space-y-3">
            <span className="inline-block px-3 py-1 bg-[#00D2C4] text-[#112233] font-black text-xs uppercase tracking-wider rounded-lg shadow-xs">
              Fresh Weekend Offer
            </span>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
              Get Flat ₹100 OFF On Your First Seafood Order
            </h3>
            <p className="text-teal-100 text-xs sm:text-sm leading-relaxed">
              Experience the unmatched sweetness of same-day fresh catch. Use code <strong className="text-white underline font-mono">FRESH100</strong> at checkout on orders above ₹699.
            </p>
            <div className="pt-2">
              <Link
                href="/offers"
                className="inline-flex items-center gap-2 px-6 py-2.5 btn-aqua rounded-xl text-xs sm:text-sm font-black shadow transition-all"
              >
                <span>View All Offers</span>
                <ArrowRight className="w-4 h-4 text-[#112233]" />
              </Link>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden md:block opacity-25">
            <Image
              src="https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80"
              alt="Tiger Prawns"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 5. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#009E93] dark:text-[#00D2C4]">
              Customer Favorites
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#112233] dark:text-[#EAF2F8] tracking-tight mt-1">
              Most Loved Seafood
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-[#009E93] dark:text-[#00D2C4] hover:underline font-bold text-sm flex items-center gap-1 group"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. SEAFOOD COMBOS SECTION */}
      {comboProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#009E93] dark:text-[#00D2C4]">
                Curated Feast Packs
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#112233] dark:text-[#EAF2F8] tracking-tight mt-1">
                Seafood Combo Packs
              </h2>
            </div>
            <Link
              href="/category/seafood-combos"
              className="text-[#009E93] dark:text-[#00D2C4] hover:underline font-bold text-sm flex items-center gap-1 group"
            >
              <span>Explore All Combos</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {comboProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 7. WHY CHOOSE FISH BASKET */}
      <section className="bg-[#EDF3F5] dark:bg-[#0E1720] py-16 border-y border-[#DCE5EA] dark:border-[#1E2D3B] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#009E93] dark:text-[#00D2C4]">
              The Fish Basket Standard
            </span>
            <h2 className="text-3xl font-black text-[#112233] dark:text-[#EAF2F8] tracking-tight mt-1">
              Why Seafood Lovers Choose Us
            </h2>
            <p className="text-xs sm:text-sm text-[#52667A] dark:text-[#9DB0C0] mt-2">
              We eliminated the unpleasant fish-market chaos, formalin doubts, and messy prep so you get pure, fresh seafood ready for your cooking pan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-[#17232E] p-7 rounded-2xl border border-[#DCE5EA] dark:border-[#243444] shadow-xs transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#00D2C4]/15 text-[#00D2C4] flex items-center justify-center mb-4 border border-[#00D2C4]/25">
                <ShieldCheck className="w-6 h-6 text-[#00D2C4]" />
              </div>
              <h3 className="font-bold text-base text-[#112233] dark:text-[#EAF2F8] mb-2">
                100% Formalin & Chemical Free
              </h3>
              <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] leading-relaxed">
                Ordinary local market fish often sit in ammonia or chemical baths to delay spoilage. At Fish Basket, every batch is certified chemical-free and chilled exclusively on pure food-grade ice.
              </p>
            </div>

            <div className="bg-white dark:bg-[#17232E] p-7 rounded-2xl border border-[#DCE5EA] dark:border-[#243444] shadow-xs transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#00D2C4]/15 text-[#00D2C4] flex items-center justify-center mb-4 border border-[#00D2C4]/25">
                <Scissors className="w-6 h-6 text-[#00D2C4]" />
              </div>
              <h3 className="font-bold text-base text-[#112233] dark:text-[#EAF2F8] mb-2">
                Cleaned Net Weight Guarantee
              </h3>
              <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] leading-relaxed">
                No surprises! We transparently show the gross raw catch weight alongside estimated clean net weight, so you pay honestly for what reaches your cooking pot.
              </p>
            </div>

            <div className="bg-white dark:bg-[#17232E] p-7 rounded-2xl border border-[#DCE5EA] dark:border-[#243444] shadow-xs transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#00D2C4]/15 text-[#00D2C4] flex items-center justify-center mb-4 border border-[#00D2C4]/25">
                <Truck className="w-6 h-6 text-[#00D2C4]" />
              </div>
              <h3 className="font-bold text-base text-[#112233] dark:text-[#EAF2F8] mb-2">
                Temperature Controlled Cold-Chain
              </h3>
              <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] leading-relaxed">
                From the harbor boat to your doorstep, our seafood never breaks the 0°C - 4°C chilled threshold. Delivered with reusable frozen gel packs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#009E93] dark:text-[#00D2C4]">
            From Harbor to Pan
          </span>
          <h2 className="text-3xl font-black text-[#112233] dark:text-[#EAF2F8] tracking-tight mt-1">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-[#17232E] p-6 rounded-2xl border border-[#DCE5EA] dark:border-[#243444] relative shadow-xs transition-colors">
            <span className="w-8 h-8 rounded-full bg-[#00D2C4] text-[#112233] font-black text-xs flex items-center justify-center mb-3">
              1
            </span>
            <h4 className="font-bold text-[#112233] dark:text-[#EAF2F8] text-sm mb-1.5">Dawn Netting</h4>
            <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] leading-relaxed">
              Trawlers dock at dawn. Our marine quality inspectors inspect and select only premium grade catches.
            </p>
          </div>

          <div className="bg-white dark:bg-[#17232E] p-6 rounded-2xl border border-[#DCE5EA] dark:border-[#243444] relative shadow-xs transition-colors">
            <span className="w-8 h-8 rounded-full bg-[#00D2C4] text-[#112233] font-black text-xs flex items-center justify-center mb-3">
              2
            </span>
            <h4 className="font-bold text-[#112233] dark:text-[#EAF2F8] text-sm mb-1.5">Artisanal Cutting</h4>
            <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] leading-relaxed">
              Master fishmongers descale, degut, and slice your catch to your exact curry or fry cut specifications.
            </p>
          </div>

          <div className="bg-white dark:bg-[#17232E] p-6 rounded-2xl border border-[#DCE5EA] dark:border-[#243444] relative shadow-xs transition-colors">
            <span className="w-8 h-8 rounded-full bg-[#00D2C4] text-[#112233] font-black text-xs flex items-center justify-center mb-3">
              3
            </span>
            <h4 className="font-bold text-[#112233] dark:text-[#EAF2F8] text-sm mb-1.5">Chilled Ice Packaging</h4>
            <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] leading-relaxed">
              Sealed in food-grade vacuum trays with sub-zero gel cooling packs to maintain peak ocean sweetness.
            </p>
          </div>

          <div className="bg-white dark:bg-[#17232E] p-6 rounded-2xl border border-[#DCE5EA] dark:border-[#243444] relative shadow-xs transition-colors">
            <span className="w-8 h-8 rounded-full bg-[#00D2C4] text-[#112233] font-black text-xs flex items-center justify-center mb-3">
              4
            </span>
            <h4 className="font-bold text-[#112233] dark:text-[#EAF2F8] text-sm mb-1.5">Doorstep Delivery</h4>
            <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] leading-relaxed">
              Delivered within your chosen slot (Morning, Afternoon, or Evening) ready to cook immediately.
            </p>
          </div>
        </div>
      </section>

      {/* 9. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#009E93] dark:text-[#00D2C4]">
              Verified Coastal Buyers
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#112233] dark:text-[#EAF2F8] tracking-tight mt-1">
              Customer Reviews
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white dark:bg-[#17232E] p-6 rounded-2xl border border-[#DCE5EA] dark:border-[#243444] shadow-xs flex flex-col justify-between transition-colors"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-2.5">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <h4 className="font-bold text-[#112233] dark:text-[#EAF2F8] text-sm">{rev.title}</h4>
                <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] mt-2 leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#DCE5EA] dark:border-[#243444] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#112233] dark:text-[#EAF2F8] block">{rev.author_name}</span>
                  <span className="text-[10px] text-[#009E93] dark:text-[#00D2C4] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#00D2C4]" /> Verified Seafood Buyer
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#009E93] dark:text-[#00D2C4]">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#112233] dark:text-[#EAF2F8] tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          <details className="bg-white dark:bg-[#17232E] rounded-2xl border border-[#DCE5EA] dark:border-[#243444] p-5 group open:shadow-xs transition-all cursor-pointer">
            <summary className="font-bold text-sm text-[#112233] dark:text-[#EAF2F8] flex items-center justify-between list-none">
              <span>How does Fish Basket ensure seafood freshness without preservatives?</span>
              <span className="text-[#00D2C4] font-black text-lg group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] mt-3 leading-relaxed">
              We source directly from harbor fishing trawlers every morning. The fish is transported in insulated ice containers, hygienically cut in sanitized facility, and packaged with sub-zero gel cooling packs to maintain temperature at 0°C to 4°C throughout transit. Zero chemicals or formalin are ever used.
            </p>
          </details>

          <details className="bg-white dark:bg-[#17232E] rounded-2xl border border-[#DCE5EA] dark:border-[#243444] p-5 group open:shadow-xs transition-all cursor-pointer">
            <summary className="font-bold text-sm text-[#112233] dark:text-[#EAF2F8] flex items-center justify-between list-none">
              <span>Why is the net cleaned weight different from the gross weight?</span>
              <span className="text-[#00D2C4] font-black text-lg group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] mt-3 leading-relaxed">
              When raw fish or prawns are harvested, the gross weight includes inedible parts like scales, viscera (guts), fins, or prawn shells. When you choose an option like Curry Cut or Peeled Prawns, our butchers clean and remove these parts (typically 15% to 35% waste). We clearly display both gross catch weight and estimated clean weight on every product card!
            </p>
          </details>

          <details className="bg-white dark:bg-[#17232E] rounded-2xl border border-[#DCE5EA] dark:border-[#243444] p-5 group open:shadow-xs transition-all cursor-pointer">
            <summary className="font-bold text-sm text-[#112233] dark:text-[#EAF2F8] flex items-center justify-between list-none">
              <span>What are the available delivery slots?</span>
              <span className="text-[#00D2C4] font-black text-lg group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] mt-3 leading-relaxed">
              We deliver four times daily across serviceable zones in Visakhapatnam: Early Morning (06:30 AM - 09:30 AM), Mid-Morning (10:00 AM - 01:00 PM), Evening Fresh (04:30 PM - 07:30 PM), and Dinner Special (07:30 PM - 09:30 PM).
            </p>
          </details>

          <details className="bg-white dark:bg-[#17232E] rounded-2xl border border-[#DCE5EA] dark:border-[#243444] p-5 group open:shadow-xs transition-all cursor-pointer">
            <summary className="font-bold text-sm text-[#112233] dark:text-[#EAF2F8] flex items-center justify-between list-none">
              <span>What if I am unhappy with the catch quality upon delivery?</span>
              <span className="text-[#00D2C4] font-black text-lg group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] mt-3 leading-relaxed">
              We offer a 100% Freshness Guarantee. If you find the seafood damaged or not fresh, notify our support team within 2 hours of delivery with a photo, and we will initiate an immediate replacement or full refund according to our Refund Policy.
            </p>
          </details>
        </div>
      </section>

      {/* 11. NEWSLETTER SIGNUP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#0B131A] rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden border border-[#1E2D3B]">
          <div className="max-w-xl mx-auto space-y-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-[#00D2C4]/20 text-[#00D2C4] mx-auto flex items-center justify-center border border-[#00D2C4]/30">
              <Mail className="w-5 h-5 text-[#00D2C4]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Get Daily Harbor Fresh Catch Alerts
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Subscribe to receive morning catch alerts, seasonal availability (like Hilsa & Lobster), and exclusive weekend discount codes.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </div>
  );
}
