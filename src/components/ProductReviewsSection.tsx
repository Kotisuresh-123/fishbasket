'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ProductReview } from '@/types';
import { Star, ShieldCheck, CheckCircle2, AlertCircle, MessageSquarePlus } from 'lucide-react';

interface ProductReviewsSectionProps {
  productId: string;
  initialReviews: ProductReview[];
}

export default function ProductReviewsSection({
  productId,
  initialReviews,
}: ProductReviewsSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [eligibilityReason, setEligibilityReason] = useState<string>('');

  // Review Form
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      setEligible(false);
      setEligibilityReason('Sign in to leave a review for this fresh catch.');
      return;
    }

    const checkEligibility = async () => {
      try {
        const res = await fetch(`/api/reviews?checkUserId=${user.id}&productId=${productId}`);
        const data = await res.json();
        if (data.success) {
          setEligible(data.canReview);
          if (!data.canReview) {
            setEligibilityReason(data.reason || 'Only verified buyers can review.');
          }
        }
      } catch (err) {
        console.error('Failed to verify review eligibility:', err);
      }
    };

    checkEligibility();
  }, [user, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          user_id: user.id,
          author_name: user.display_name || user.full_name,
          rating,
          title,
          comment,
        }),
      });

      const data = await res.json();
      if (data.success && data.review) {
        setReviews([data.review, ...reviews]);
        setSubmitSuccess(true);
        setShowForm(false);
        setEligible(false);
        setEligibilityReason('You have already submitted a review for this fresh catch.');
      } else {
        setSubmitError(data.message || 'Failed to submit review.');
      }
    } catch {
      setSubmitError('Network error submitting review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-14 pt-10 border-t border-[#DCE5EA] dark:border-[#243444] space-y-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-[#112233] dark:text-[#EAF2F8] tracking-tight">
            Verified Customer Reviews
          </h3>
          <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] mt-0.5">
            Based on {reviews.length} authentic seafood purchases
          </p>
        </div>

        {user ? (
          eligible ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 btn-aqua font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs self-start sm:self-auto cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4 text-[#112233]" />
              <span>{showForm ? 'Cancel Review' : 'Write a Verified Review'}</span>
            </button>
          ) : (
            <div className="text-[11px] text-[#52667A] dark:text-[#9DB0C0] bg-[#EDF3F5] dark:bg-[#17232E] px-3 py-1.5 rounded-xl border border-[#DCE5EA] dark:border-[#243444]">
              <span className="font-semibold text-[#112233] dark:text-[#EAF2F8]">Buyer Protection: </span>
              {eligibilityReason}
            </div>
          )
        ) : (
          <Link
            href="/login"
            className="text-xs text-[#009E93] dark:text-[#00D2C4] font-semibold hover:underline self-start sm:self-auto"
          >
            Log in to leave a review →
          </Link>
        )}
      </div>

      {submitSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Thank you! Your verified review has been posted.</span>
        </div>
      )}

      {/* Write Review Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#17232E] p-6 rounded-2xl border border-[#00D2C4]/40 shadow-xl space-y-4 animate-in fade-in text-xs transition-colors"
        >
          <div className="flex justify-between items-center pb-2 border-b border-[#DCE5EA] dark:border-[#243444]">
            <h4 className="font-bold text-sm text-[#112233] dark:text-[#EAF2F8]">Write Your Catch Review</h4>
            <span className="text-[10px] text-[#009E93] dark:text-[#00D2C4] font-bold bg-[#00D2C4]/15 px-2 py-0.5 rounded-full border border-[#00D2C4]/30">
              Verified Order
            </span>
          </div>

          {submitError && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-[#112233] dark:text-[#EAF2F8] mb-1">
              Catch Freshness & Quality Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-[#DCE5EA] dark:text-[#243444] hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-[#C5D2DB] dark:text-[#243444]'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 font-bold text-[#112233] dark:text-[#EAF2F8]">
                {rating === 5 ? '5 - Excellent fresh catch' : `${rating} Stars`}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#112233] dark:text-[#EAF2F8] mb-1">Review Headline</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Incredibly fresh and sweet taste!"
              className="w-full px-3 py-2 rounded-xl border border-[#DCE5EA] dark:border-[#243444] bg-[#EDF3F5] dark:bg-[#0F1820] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:border-[#00D2C4] font-medium placeholder:text-[#7E92A2] dark:placeholder:text-[#6B7F91]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#112233] dark:text-[#EAF2F8] mb-1">Detailed Feedback</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other seafood lovers about the freshness, cut preparation, delivery condition, and cooking results..."
              className="w-full px-3 py-2 rounded-xl border border-[#DCE5EA] dark:border-[#243444] bg-[#EDF3F5] dark:bg-[#0F1820] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:border-[#00D2C4] font-medium placeholder:text-[#7E92A2] dark:placeholder:text-[#6B7F91]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE5EA] dark:border-[#243444]">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-[#DCE5EA] dark:border-[#243444] text-[#52667A] dark:text-[#9DB0C0] hover:bg-slate-100 dark:hover:bg-[#1F2E3D] rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 btn-aqua disabled:opacity-50 rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white dark:bg-[#17232E] p-8 rounded-2xl border border-[#DCE5EA] dark:border-[#243444] text-center text-[#52667A] dark:text-[#9DB0C0] text-xs">
          Be the first customer to review this catch after your order!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white dark:bg-[#17232E] p-5 rounded-2xl border border-[#DCE5EA] dark:border-[#243444] space-y-2 text-xs shadow-xs transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-[#DCE5EA] dark:text-[#243444]'
                      }`}
                    />
                  ))}
                  <span className="text-[11px] font-bold text-[#52667A] dark:text-[#9DB0C0] ml-1">
                    {r.rating}.0
                  </span>
                </div>
                <span className="text-[10px] text-[#7E92A2] dark:text-[#6B7F91]">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              <h5 className="font-bold text-xs text-[#112233] dark:text-[#EAF2F8]">{r.title}</h5>
              <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
              <div className="text-[11px] text-[#009E93] dark:text-[#00D2C4] font-semibold pt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00D2C4]" />
                <span>{r.author_name} (Verified Catch Buyer)</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
