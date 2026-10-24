import React from 'react';
import Link from 'next/link';
import FishBasketLogo from './FishBasketLogo';
import { Phone, Mail, MapPin, Clock, ShieldCheck, HeartHandshake, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Today's Morning Catch</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Directly from fishing trawlers within hours of netting, never stored in chemical preservatives.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Chemical & Formalin Free</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                100% natural seafood rigorously tested for zero chemicals, ammonia, or adulterants.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Chilled Cold-Chain Delivery</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Delivered in food-grade insulated boxes with gel ice pads maintained at 0°C to 4°C.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-500/20">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Artisanal Custom Cuts</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Cut to order by expert fishmongers in sanitized cleanrooms. Cleaned net weight guaranteed.
              </p>
            </div>
          </div>
        </div>

        {/* Links Navigation Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-12">
          {/* Brand Info */}
          <div className="col-span-2">
            <FishBasketLogo variant="white" />
            <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-sm">
              Fish Basket is an authentic fresh seafood marketplace dedicated to bringing harbor-fresh, river-fresh, and deep-sea catches straight to your kitchen with utmost hygiene and care.
            </p>
            <div className="mt-4 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-slate-200 font-semibold">+91 89190 23456</span> (06:00 AM - 09:00 PM)
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400" />
                <span>care@fishbasket.in</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>Harbor Terminal 3, Coastal Road, Visakhapatnam, AP 530001</span>
              </div>
            </div>
          </div>

          {/* Seafood Categories */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Categories
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/category/freshwater-fish" className="hover:text-teal-400 transition-colors">
                  Freshwater Fish
                </Link>
              </li>
              <li>
                <Link href="/category/sea-fish" className="hover:text-teal-400 transition-colors">
                  Sea Fish
                </Link>
              </li>
              <li>
                <Link href="/category/prawns" className="hover:text-teal-400 transition-colors">
                  Prawns & Shrimp
                </Link>
              </li>
              <li>
                <Link href="/category/crabs" className="hover:text-teal-400 transition-colors">
                  Crabs
                </Link>
              </li>
              <li>
                <Link href="/category/lobster" className="hover:text-teal-400 transition-colors">
                  Wild Lobsters
                </Link>
              </li>
              <li>
                <Link href="/category/squid-cuttlefish" className="hover:text-teal-400 transition-colors">
                  Squid & Cuttlefish
                </Link>
              </li>
              <li>
                <Link href="/category/seafood-combos" className="hover:text-teal-400 transition-colors">
                  Seafood Combos
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Quick Links
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop" className="hover:text-teal-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-teal-400 transition-colors">
                  Offers & Coupons
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-teal-400 transition-colors">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-teal-400 transition-colors">
                  About Fish Basket
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-teal-400 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-teal-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Compliance */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Policies
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shipping-policy" className="hover:text-teal-400 transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-teal-400 transition-colors">
                  Cancellation & Refund
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-teal-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-teal-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-400 transition-colors">
                  Partner / Staff Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Fish Basket (India) Private Limited. All rights reserved.
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Secure Razorpay Payments</span>
            <span>•</span>
            <span>FSSAI Compliant Cold-Chain</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
