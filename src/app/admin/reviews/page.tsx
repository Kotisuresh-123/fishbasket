'use client';

import React, { useState } from 'react';
import { ProductReview } from '@/types';
import { Star, Check, Trash2, ShieldCheck } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([
    {
      id: 'rev-1',
      product_id: 'p1',
      user_id: 'u1',
      author_name: 'Suresh Kumar',
      rating: 5,
      title: 'Super fresh Rohu!',
      comment: 'Delivered chilled with gel ice packs. Absolutely clean curry cut with zero fishy odor. Cooked the same afternoon and taste was sweet and tender.',
      is_verified_buyer: true,
      is_approved: true,
      created_at: '2026-10-18T10:00:00Z',
    },
    {
      id: 'rev-2',
      product_id: 'p4',
      user_id: 'u1',
      author_name: 'Dr. Ananya Rao',
      rating: 5,
      title: 'Top notch Surmai fry slices',
      comment: 'The slices were uniform, firm and single-bone. Made spicy rava fry for Sunday lunch. Highly recommend Fish Basket!',
      is_verified_buyer: true,
      is_approved: true,
      created_at: '2026-10-19T14:30:00Z',
    },
    {
      id: 'rev-3',
      product_id: 'p7',
      user_id: 'u1',
      author_name: 'K. Venkat',
      rating: 5,
      title: 'Huge juicy prawns',
      comment: 'Peeled and deveined properly. Saved 30 mins of prep time in the kitchen. Very juicy when sauteed in garlic butter.',
      is_verified_buyer: true,
      is_approved: true,
      created_at: '2026-10-21T09:20:00Z',
    },
  ]);

  const handleToggleApprove = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_approved: !r.is_approved } : r))
    );
  };

  const handleDelete = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Review Moderation</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Approve, filter, and moderate customer reviews across all seafood products
        </p>
      </div>

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{r.author_name}</span>
                {r.is_verified_buyer && (
                  <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-teal-200">
                    <ShieldCheck className="w-3 h-3" /> Verified Buyer
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-xs">{r.title}</h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                &ldquo;{r.comment}&rdquo;
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Submitted on {new Date(r.created_at).toLocaleDateString()}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleApprove(r.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    r.is_approved
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700 hover:bg-emerald-50'
                  }`}
                >
                  {r.is_approved ? 'Approved ✓' : 'Approve Review'}
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-600"
                  title="Delete Review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
