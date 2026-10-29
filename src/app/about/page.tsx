import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, Sparkles, Scissors, Users, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#00D2C4] bg-[#00D2C4]/10 px-3 py-1 rounded-full border border-[#00D2C4]/20 inline-block">
          Our Harbor Story
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
          Redefining Fresh Seafood for Indian Homes
        </h1>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
          Fish Basket was founded with a single mission: to deliver authentic harbor-fresh seafood, free of chemical baths, cleaned net-weight guaranteed, and delivered on cold ice directly to your doorstep.
        </p>
      </div>

      {/* Visual Image & Values */}
      <div className="relative aspect-[21/9] rounded-3xl overflow-hidden shadow-xl bg-slate-900 border border-[var(--border)]">
        <Image
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80"
          alt="Fish Basket Coastal Sourcing"
          fill
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex items-end p-8 sm:p-12">
          <div className="text-white max-w-xl">
            <h3 className="text-xl sm:text-2xl font-black">Direct Coastal Partnerships</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              We partner directly with coastal trawler cooperatives in Visakhapatnam, Kakinada, and Pulicat to eliminate multi-day middleman chains.
            </p>
          </div>
        </div>
      </div>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[var(--surface)] p-8 rounded-3xl border border-[var(--border)] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00D2C4]/15 text-[#00D2C4] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Zero Formalin Assurance</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Formaldehyde and ammonia are common adulterants in wet markets. At Fish Basket, every batch undergoes rapid safety assays and is cooled exclusively on food-grade filtered ice.
          </p>
        </div>

        <div className="bg-[var(--surface)] p-8 rounded-3xl border border-[var(--border)] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00D2C4]/15 text-[#00D2C4] flex items-center justify-center">
            <Scissors className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Sanitized Temperature-Controlled Cutrooms</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Our cleanrooms are maintained below 15°C. Master fishmongers wear sanitized aprons and sterile gloves to cut, descales, and pack without cross-contamination.
          </p>
        </div>

        <div className="bg-[var(--surface)] p-8 rounded-3xl border border-[var(--border)] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00D2C4]/15 text-[#00D2C4] flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Cold-Chain Last Mile Delivery</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Our fleet uses custom insulated bags with sub-zero frozen gel packs that maintain ambient temperature between 0°C and 4°C right until your kitchen counter.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-slate-900 to-[#17232E] rounded-3xl p-8 sm:p-12 text-center text-white space-y-4 border border-[var(--border)] shadow-xl">
        <h3 className="text-2xl sm:text-3xl font-black">Ready to Taste the Difference?</h3>
        <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto">
          Order your favorite freshwater or sea fish catch today and enjoy the natural sweetness of unadulterated seafood.
        </p>
        <Link
          href="/shop"
          className="btn-aqua inline-block px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-cyan-500/20"
        >
          Shop Today&apos;s Catch
        </Link>
      </div>
    </div>
  );
}
