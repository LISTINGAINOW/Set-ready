import { mkdir, readFile, writeFile } from 'fs/promises';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';
import type { NextRequest } from 'next/server';
import type { CreateReviewInput, Review } from '@/types/review';
import { getClientIp, sanitizeInput } from '@/lib/security';

const REVIEWS_FILE = join(process.cwd(), 'data', 'reviews.json');
const REVIEW_RATE_LIMIT_FILE = '/tmp/discreet-set-review-rate-limit.json';
const REVIEW_WINDOW_MS = 60 * 60 * 1000;
const REVIEW_MAX_ATTEMPTS = 5;

export type ReviewValidationResult =
  | { success: true; value: CreateReviewInput }
  | { success: false; error: string };

export async function readReviews(): Promise<Review[]> {
  try {
    const raw = await readFile(REVIEWS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Review[]) : [];
  } catch {
    return [];
  }
}

export async function writeReviews(reviews: Review[]) {
  await mkdir(dirname(REVIEWS_FILE), { recursive: true });
  await writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2) + '\n', 'utf8');
}

export function sanitizeReviewText(value: string) {
  return sanitizeInput(value)
    .replace(/["'`]/g, (match) => ({ '"': '”', "'": '’', '`': '’' }[match] || match))
    .trim();
}

export function sanitizeReviewerName(value: string) {
  return sanitizeInput(value).replace(/[^a-zA-Z0-9 .,'-]/g, '').trim();
}

export function validateReviewInput(payload: unknown): ReviewValidationResult {
  if (!payload || typeof payload !== 'object') {
    return { success: false, error: 'Invalid review payload.' };
  }

  const input = payload as Record<string, unknown>;
  const propertyId = sanitizeInput(String(input.propertyId || ''));
  const reviewer = sanitizeReviewerName(String(input.reviewer || ''));
  const text = sanitizeReviewText(String(input.text || ''));
  const rating = Number(input.rating);

  if (!propertyId || propertyId.length < 2 || propertyId.length > 120) {
    return { success: false, error: 'Invalid property ID.' };
  }

  if (!reviewer || reviewer.length < 2 || reviewer.length > 80) {
    return { success: false, error: 'Reviewer name must be between 2 and 80 characters.' };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, error: 'Rating must be a whole number between 1 and 5.' };
  }

  if (text.length < 50 || text.length > 1000) {
    return { success: false, error: 'Review text must be between 50 and 1000 characters.' };
  }

  return {
    success: true,
    value: {
      propertyId,
      reviewer,
      text,
      rating,
    },
  };
}

export function buildReview(input: CreateReviewInput): Review {
  return {
    id: `review-${randomUUID()}`,
    propertyId: input.propertyId,
    rating: input.rating as 1 | 2 | 3 | 4 | 5,
    text: input.text,
    reviewer: input.reviewer,
    date: new Date().toISOString().split('T')[0],
    verified: false,
    featured: false,
  };
}

export function getFilteredReviews(reviews: Review[], propertyId?: string | null, featured?: string | null) {
  return reviews.filter((review) => {
    if (propertyId && review.propertyId !== propertyId) return false;
    if (featured === 'true' && !review.featured) return false;
    return true;
  });
}

export function checkReviewRateLimit(request: NextRequest) {
  const ip = getClientIp(request);
  const key = `reviews:${ip}`;
  const now = Date.now();

  let store: Record<string, number[]> = {};
  if (existsSync(REVIEW_RATE_LIMIT_FILE)) {
    try {
      store = JSON.parse(readFileSync(REVIEW_RATE_LIMIT_FILE, 'utf8')) as Record<string, number[]>;
    } catch {
      store = {};
    }
  }

  const recent = (store[key] || []).filter((timestamp) => now - timestamp < REVIEW_WINDOW_MS);
  recent.push(now);
  writeFileSync(REVIEW_RATE_LIMIT_FILE, JSON.stringify({ ...store, [key]: recent }), 'utf8');

  return {
    blocked: recent.length > REVIEW_MAX_ATTEMPTS,
    remaining: Math.max(0, REVIEW_MAX_ATTEMPTS - recent.length),
    resetInMs: recent.length ? REVIEW_WINDOW_MS - (now - recent[0]) : REVIEW_WINDOW_MS,
  };
}
