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

/**
 * GET /api/reviews?propertyId=<id>&featured=<bool>
 *
 * Returns reviews for a property, sorted newest first.
 * Reads from the local JSON file store (legacy path).
 * Future: migrate to Supabase by swapping readReviews() for a Supabase query.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const featured = searchParams.get('featured');

    // Attempt Supabase read first; fall back to file store on error.
    try {
      const { createClient } = await import('@/utils/supabase/server');
      const supabase = await createClient();

      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (propertyId) query = query.eq('property_id', propertyId);
      if (featured === '1' || featured === 'true') query = query.eq('featured', true);

      const { data, error } = await query;

      if (!error && data) {
        // Map DB columns → Review type
        const reviews = data.map((row) => ({
          id: row.id as string,
          propertyId: row.property_id as string,
          rating: row.rating as 1 | 2 | 3 | 4 | 5,
          text: (row.review_text as string) || '',
          reviewer: (row.reviewer_name as string) || '',
          guestName: (row.guest_name as string) || undefined,
          date: (row.date as string) || new Date().toISOString().slice(0, 10),
          createdAt: (row.created_at as string) || undefined,
          stayDate: (row.stay_date as string) || undefined,
          verified: Boolean(row.verified),
          bookingCompleted: Boolean(row.booking_completed),
          featured: Boolean(row.featured),
          hostResponse:
            row.host_response
              ? { hostName: (row.host_response_name as string) || 'Host', response: row.host_response as string }
              : undefined,
        }));

        return NextResponse.json({ reviews });
      }
    } catch {
      // Supabase unavailable — fall through to file store
    }

    // Fallback: file-based store
    const reviews = await readReviews();
    return NextResponse.json({
      reviews: getFilteredReviews(reviews, propertyId, featured).sort(
        (a, b) =>
          new Date(b.date || '1970-01-01').getTime() - new Date(a.date || '1970-01-01').getTime(),
      ),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load reviews.' }, { status: 500 });
  }
}

/**
 * POST /api/reviews
 *
 * Submit a new review. Requires a valid Supabase session for auth.
 * Writes to Supabase if available; falls back to file store.
 */
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
          headers: { 'Retry-After': String(Math.ceil(rateLimit.resetInMs / 1000)) },
        },
      );
    }

    const payload = await request.json();
    const validation = validateReviewInput(payload);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { value } = validation;

    // Try Supabase path first
    try {
      const { createClient } = await import('@/utils/supabase/server');
      const supabase = await createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return NextResponse.json({ error: 'You must be signed in to submit a review.' }, { status: 401 });
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          property_id: value.propertyId,
          reviewer_id: session.user.id,
          rating: value.rating,
          review_text: value.text,
          reviewer_name: value.reviewer,
          verified: false,
        })
        .select()
        .single();

      if (error) throw error;

      const review = {
        id: data.id as string,
        propertyId: data.property_id as string,
        rating: data.rating as 1 | 2 | 3 | 4 | 5,
        text: data.review_text as string,
        reviewer: data.reviewer_name as string,
        date: (data.date as string) || new Date().toISOString().slice(0, 10),
        createdAt: data.created_at as string,
        verified: Boolean(data.verified),
        featured: Boolean(data.featured),
      };

      writeAuditLog('review.created', {
        propertyId: review.propertyId,
        reviewId: review.id,
        verified: review.verified,
        source: 'supabase',
      });

      return NextResponse.json({ review }, { status: 201 });
    } catch (supabaseErr) {
      // If error is an auth error, surface it directly
      if (supabaseErr && typeof supabaseErr === 'object' && 'status' in supabaseErr && (supabaseErr as { status: number }).status === 401) {
        return NextResponse.json({ error: 'You must be signed in to submit a review.' }, { status: 401 });
      }
      // Otherwise fall through to file store (Supabase unavailable)
    }

    // Fallback: file-based store (no auth requirement in this path)
    const reviews = await readReviews();
    const review = buildReview(value);
    reviews.push(review);
    await writeReviews(reviews);

    writeAuditLog('review.created', {
      propertyId: review.propertyId,
      reviewId: review.id,
      verified: review.verified,
      featured: review.featured,
      source: 'file',
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to submit review.' }, { status: 500 });
  }
}
