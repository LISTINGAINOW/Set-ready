'use client';

import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, MessageSquare, Star } from 'lucide-react';
import type { Review } from '@/types/review';

interface ReviewSectionProps {
  propertyId: string;
  initialReviews?: Review[];
}

function RatingStars({ rating, size = 'h-4 w-4' }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${star <= Math.round(rating) ? 'fill-blue-600 text-blue-600' : 'text-blue-200'}`}
        />
      ))}
    </div>
  );
}

function InteractiveStars({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (r: 1 | 2 | 3 | 4 | 5) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? rating;

  return (
    <div className="flex items-center gap-1">
      {([1, 2, 3, 4, 5] as const).map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          className="focus:outline-none"
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              star <= active ? 'fill-blue-600 text-blue-600' : 'text-blue-200 hover:text-blue-400'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * ReviewForm — requires the user to be logged in.
 * Falls back to a prompt linking to /login when no session is found.
 */
function ReviewForm({
  propertyId,
  onSubmitted,
  isLoggedIn,
}: {
  propertyId: string;
  onSubmitted: (r: Review) => void;
  isLoggedIn: boolean;
}) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [reviewer, setReviewer] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const textLength = text.trim().length;
  const isValid = useMemo(
    () => reviewer.trim().length >= 2 && reviewer.trim().length <= 80 && textLength >= 10 && textLength <= 2000,
    [reviewer, textLength],
  );

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-dashed border-black/20 bg-white/60 p-6 text-center">
        <p className="text-sm text-black/60">
          <a href="/login" className="font-semibold text-blue-600 underline">
            Sign in
          </a>{' '}
          to leave a review for this property.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, rating, reviewer: reviewer.trim(), text: text.trim() }),
      });

      const data = (await res.json()) as { error?: string; review?: Review };

      if (!res.ok || !data.review) {
        setError(data.error || 'Failed to submit review.');
        return;
      }

      setReviewer('');
      setText('');
      setRating(5);
      setSuccess('Review submitted! It appears below as an unverified guest review.');
      onSubmitted(data.review);
    } catch {
      setError('Unable to submit right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black bg-white/70 p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-black">Leave a review</h3>
          <p className="mt-1 text-sm text-black/60">
            Share useful feedback for future guests. All new reviews are unverified until tied to a completed booking.
          </p>
        </div>
        <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/60">Public</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-black">Overall rating</label>
          <InteractiveStars rating={rating} onChange={setRating} />
        </div>

        {/* Name */}
        <div>
          <label htmlFor="reviewer-name" className="mb-1 block text-sm font-semibold text-black">
            Your name <span className="text-black/40 font-normal">(2–80 characters)</span>
          </label>
          <input
            id="reviewer-name"
            type="text"
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            placeholder="First name or nickname"
            maxLength={80}
            className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder-black/30 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* Review Text */}
        <div>
          <label htmlFor="review-text" className="mb-1 block text-sm font-semibold text-black">
            Review{' '}
            <span className="text-black/40 font-normal">
              ({textLength}/2000, min 10)
            </span>
          </label>
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe your experience with this location…"
            rows={5}
            maxLength={2000}
            className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder-black/30 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {success && <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>}

        <button
          type="submit"
          disabled={!isValid || submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {submitting ? 'Submitting…' : 'Submit review'}
        </button>
      </form>
    </div>
  );
}

/**
 * ReviewSection — full reviews widget for property detail pages.
 * Fetches reviews from /api/reviews, computes aggregate stats,
 * and renders ReviewForm gated on Supabase session.
 */
export default function ReviewSection({ propertyId, initialReviews = [] }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  // Check Supabase session client-side
  useEffect(() => {
    async function checkSession() {
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setLoadingSession(false);
      }
    }
    void checkSession();
  }, []);

  // Fetch reviews if none provided
  useEffect(() => {
    if (initialReviews.length > 0) return;
    fetch(`/api/reviews?propertyId=${encodeURIComponent(propertyId)}`)
      .then((r) => r.json())
      .then((data: { reviews?: Review[] }) => {
        if (Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      })
      .catch(() => {});
  }, [propertyId, initialReviews.length]);

  const stats = useMemo(() => {
    const count = reviews.length;
    const average = count > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
    const recommended = count > 0 ? Math.round((reviews.filter((r) => r.rating >= 4).length / count) * 100) : 0;
    return { count, average, recommended };
  }, [reviews]);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-2xl border border-black bg-white/60 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Reviews & ratings</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="text-4xl font-bold text-black">
                {stats.average ? stats.average.toFixed(1) : '—'}
              </div>
              <div>
                <RatingStars rating={stats.average} size="h-5 w-5" />
                <p className="mt-2 text-sm text-black/60">
                  Based on {stats.count} review{stats.count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
            <div className="rounded-xl border border-black bg-white px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">Average</p>
              <p className="mt-2 text-2xl font-bold text-black">
                {stats.average ? `${stats.average.toFixed(1)}/5` : '—'}
              </p>
            </div>
            <div className="rounded-xl border border-black bg-white px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">Recommended</p>
              <p className="mt-2 text-2xl font-bold text-black">{stats.recommended}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Form */}
      {!loadingSession && (
        <ReviewForm
          propertyId={propertyId}
          isLoggedIn={isLoggedIn}
          onSubmitted={(r) => setReviews((prev) => [r, ...prev])}
        />
      )}

      {/* Review list */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/30 bg-white/50 p-8 text-center">
            <MessageSquare className="mx-auto mb-3 h-8 w-8 text-black/20" />
            <p className="text-sm text-black/50">No reviews yet. Be the first to share your experience.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-black bg-white/70 p-6 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-black">{review.reviewer || review.guestName || 'Anonymous'}</span>
                    {review.verified && (
                      <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        <BadgeCheck className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <RatingStars rating={review.rating} />
                </div>
                <time className="shrink-0 text-xs text-black/40">
                  {formatDate(review.stayDate || review.date)}
                </time>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-black/80">{review.text || review.review}</p>

              {review.hostResponse && (
                <div className="mt-4 rounded-xl bg-black/5 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-black/50">
                    Response from {review.hostResponse.hostName}
                  </p>
                  <p className="text-sm text-black/70">{review.hostResponse.response}</p>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
