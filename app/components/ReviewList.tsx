'use client';

import { useMemo, useState } from 'react';
import { BadgeCheck, MessageSquare, Star } from 'lucide-react';
import ReviewForm from '@/app/components/ReviewForm';
import type { Review } from '@/types/review';

interface ReviewListProps {
  propertyId?: string;
  initialReviews: Review[];
  showForm?: boolean;
  title?: string;
  description?: string;
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function RatingStars({ rating, size = 'h-4 w-4' }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`${size} ${star <= Math.round(rating) ? 'fill-blue-600 text-blue-600' : 'text-blue-200'}`} />
      ))}
    </div>
  );
}

export default function ReviewList({
  propertyId,
  initialReviews,
  showForm = true,
  title = 'Reviews & ratings',
  description = 'Guest feedback appears here. Verified badges are reserved for booking-backed reviews only.',
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>(
    [...initialReviews].sort(
      (a, b) => new Date(b.createdAt || b.date || '1970-01-01').getTime() - new Date(a.createdAt || a.date || '1970-01-01').getTime(),
    ),
  );

  const stats = useMemo(() => {
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount : 0;

    return {
      reviewCount,
      averageRating,
      recommendationRate: reviewCount > 0 ? Math.round((reviews.filter((review) => review.rating >= 4).length / reviewCount) * 100) : 0,
    };
  }, [reviews]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black bg-white/60 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">{title}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="text-4xl font-bold text-black">{stats.averageRating ? stats.averageRating.toFixed(1) : '—'}</div>
              <div>
                <RatingStars rating={stats.averageRating} size="h-5 w-5" />
                <p className="mt-2 text-sm text-black/60">
                  Based on {stats.reviewCount} review{stats.reviewCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm text-black/70 sm:text-base">{description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
            <div className="rounded-xl border border-black bg-white px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">Average</p>
              <p className="mt-2 text-2xl font-bold text-black">{stats.averageRating ? stats.averageRating.toFixed(1) : '—'}/5</p>
            </div>
            <div className="rounded-xl border border-black bg-white px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">Recommended</p>
              <p className="mt-2 text-2xl font-bold text-black">{stats.recommendationRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {showForm && propertyId ? <ReviewForm propertyId={propertyId} onSubmitted={(review) => setReviews((current) => [review, ...current])} /> : null}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/30 bg-white/50 p-8 text-center text-black/60">
            No reviews yet.
          </div>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-black bg-white/70 p-6 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-black">{review.guestName || review.reviewer}</h3>
                    {review.verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-600">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verified booking
                      </span>
                    ) : null}
                    {review.featured ? (
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700">Featured review</span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-black/60">
                    <RatingStars rating={review.rating} />
                    <span>Posted {formatDate(review.date || review.createdAt || '1970-01-01')}</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {review.rating}/5 rating
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-black/80 sm:text-base">{review.review || review.text}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
