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
    <div className="mt-14 pt-10 border-t border-slate-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Verified Customer Reviews
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Based on {reviews.length} authentic seafood purchases
          </p>
        </div>

        {user ? (
          eligible ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{showForm ? 'Cancel Review' : 'Write a Verified Review'}</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700">Buyer Protection: </span>
              {eligibilityReason}
            </div>
          )
        ) : (
          <Link
            href="/login"
            className="text-xs text-teal-700 font-semibold hover:underline self-start sm:self-auto"
          >
            Log in to leave a review →
          </Link>
        )}
      </div>

      {submitSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Thank you! Your verified review has been posted.</span>
        </div>
      )}

      {/* Write Review Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl border border-teal-200 shadow-lg space-y-4 animate-in fade-in text-xs"
        >
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h4 className="font-bold text-sm text-slate-900">Write Your Catch Review</h4>
            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Verified Order
            </span>
          </div>

          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catch Freshness & Quality Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-200 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 font-bold text-slate-700">
                {rating === 5 ? '5 - Excellent fresh catch' : `${rating} Stars`}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Review Headline</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Incredibly fresh and sweet taste!"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Feedback</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other seafood lovers about the freshness, cut preparation, delivery condition, and cooking results..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs transition-colors"
            >
              {submitting ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          Be the first customer to review this catch after your order!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                  <span className="text-[11px] font-bold text-slate-600 ml-1">
                    {r.rating}.0
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              <h5 className="font-bold text-xs text-slate-900">{r.title}</h5>
              <p className="text-xs text-slate-600 leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
              <div className="text-[11px] text-teal-700 font-semibold pt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>{r.author_name} (Verified Catch Buyer)</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
