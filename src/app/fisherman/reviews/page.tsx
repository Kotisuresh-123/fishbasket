'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProductReview, Product } from '@/types';
import { Star, ShieldCheck, MessageSquare, RefreshCw, Anchor } from 'lucide-react';

export default function FishermanReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [revRes, prodRes] = await Promise.all([
          fetch(`/api/reviews?fishermanId=${user.id}`),
          fetch('/api/products?limit=100'),
        ]);

        const revData = await revRes.json();
        const prodData = await prodRes.json();

        if (revData.success) {
          setReviews(revData.reviews || []);
        }

        if (prodData.success) {
          const map: Record<string, Product> = {};
          (prodData.products || []).forEach((p: Product) => {
            map[p.id] = p;
          });
          setProducts(map);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Catch Ratings & Customer Reviews</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Feedback from verified seafood buyers on catches supplied by {user?.display_name || user?.full_name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <div>
              <span className="text-base font-black text-slate-900">{avgRating}</span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">Fisherman Rating</span>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-base font-black text-slate-900">{reviews.length}</span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">Verified Reviews</span>
          </div>
        </div>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
          <span className="text-xs text-slate-500 font-semibold">Loading verified reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No reviews received yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once customers complete and receive orders containing your seafood, their verified reviews will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => {
            const product = products[rev.product_id];
            return (
              <div
                key={rev.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{rev.author_name}</span>
                    {rev.is_verified_buyer && (
                      <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-teal-200">
                        <ShieldCheck className="w-3 h-3" /> Verified Buyer
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-slate-500 font-bold ml-1 text-xs">
                      {rev.rating}.0
                    </span>
                  </div>
                </div>

                {product && (
                  <div className="text-[11px] text-teal-800 bg-teal-50/70 px-3 py-1.5 rounded-xl border border-teal-100 flex items-center gap-1.5 w-fit">
                    <Anchor className="w-3.5 h-3.5 text-teal-600" />
                    <span>Product: <strong>{product.name}</strong></span>
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{rev.title}</h4>
                  <p className="text-slate-600 mt-1 leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                  Reviewed on {new Date(rev.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
