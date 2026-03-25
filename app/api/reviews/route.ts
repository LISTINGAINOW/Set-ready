import { NextRequest, NextResponse } from 'next/server';
import {
  buildReview,
  checkReviewRateLimit,
  getFilteredReviews,
  readReviews,
  validateReviewInput,
  writeReviews,
} from '@/lib/reviews';
import { writeAuditLog } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const featured = searchParams.get('featured');
    const reviews = await readReviews();

    return NextResponse.json({
      reviews: getFilteredReviews(reviews, propertyId, featured).sort(
        (a, b) => new Date(b.date || '1970-01-01').getTime() - new Date(a.date || '1970-01-01').getTime(),
      ),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load reviews.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkReviewRateLimit(request);
    if (rateLimit.blocked) {
      return NextResponse.json(
        {
          error: 'Too many review submissions. Please wait before trying again.',
          retryAfterSeconds: Math.ceil(rateLimit.resetInMs / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimit.resetInMs / 1000)),
          },
        },
      );
    }

    const payload = await request.json();
    const validation = validateReviewInput(payload);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const reviews = await readReviews();
    const review = buildReview(validation.value);
    reviews.push(review);
    await writeReviews(reviews);

    writeAuditLog('review.created', {
      propertyId: review.propertyId,
      reviewId: review.id,
      verified: review.verified,
      featured: review.featured,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to submit review.' }, { status: 500 });
  }
}
