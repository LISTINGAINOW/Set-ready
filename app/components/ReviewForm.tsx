'use client';

import { useMemo, useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import type { Review } from '@/types/review';
import { sanitizeInput } from '@/lib/client-security';

interface ReviewFormProps {
  propertyId: string;
  onSubmitted?: (review: Review) => void;
}

export default function ReviewForm({ propertyId, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [reviewer, setReviewer] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeRating = hoveredRating ?? rating;
  const textLength = text.trim().length;
  const isValid = useMemo(() => {
    return reviewer.trim().length >= 2 && reviewer.trim().length <= 80 && textLength >= 50 && textLength <= 1000;
  }, [reviewer, textLength]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          rating,
          reviewer: sanitizeInput(reviewer),
          text: sanitizeInput(text),
        }),
      });

      const payload = (await response.json()) as { error?: string; review?: Review };

      if (!response.ok || !payload.review) {
        setError(payload.error || 'Something went wrong while submitting your review.');
        return;
      }

      setReviewer('');
      setText('');
      setRating(5);
      setHoveredRating(null);
      setSuccess('Review submitted. It appears below as an unverified guest review.');
      onSubmitted?.(payload.review);
    } catch {
      setError('Unable to submit your review right now. Try again in a bit.');
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
            Share a clear, useful note for future guests. Reviews are public and all new submissions are marked unverified unless tied to a booking later.
          </p>
        </div>
        <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/60">Public review</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="reviewer" className="mb-2 block text-sm font-medium text-black">
            Your name
          </label>
          <input
            id="reviewer"
            value={reviewer}
            onChange={(event) => setReviewer(sanitizeInput(event.target.value).slice(0, 80))}
            className="w-full rounded-xl border border-black bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-blue-600"
            placeholder="Alex M."
            maxLength={80}
          />
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-black">Overall rating</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => {
              const filled = value <= activeRating;
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                  onClick={() => setRating(value as 1 | 2 | 3 | 4 | 5)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className="rounded-full p-1 transition hover:scale-105"
                >
                  <Star className={`h-7 w-7 ${filled ? 'fill-blue-600 text-blue-600' : 'text-blue-200'}`} />
                </button>
              );
            })}
            <span className="ml-2 text-sm text-black/60">{rating}.0 / 5</span>
          </div>
        </div>

        <div>
          <label htmlFor="reviewText" className="mb-2 block text-sm font-medium text-black">
            Your review
          </label>
          <textarea
            id="reviewText"
            value={text}
            onChange={(event) => setText(sanitizeInput(event.target.value).slice(0, 1000))}
            rows={5}
            className="w-full rounded-xl border border-black bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-blue-600"
            placeholder="What worked well? What should future guests expect?"
            maxLength={1000}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-black/50">
            <p>50–1000 characters. HTML is stripped.</p>
            <p>{textLength}/1000</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Submit review
          </button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {!error && success ? <p className="text-sm text-blue-600">{success}</p> : null}
        </div>
      </form>
    </div>
  );
}
