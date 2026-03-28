/**
 * HIGH-4: This webhook handler has been consolidated into /api/webhooks/stripe.
 * This route is kept as a redirect shim so that any Stripe dashboard entries
 * pointing to this URL continue to work until updated.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Forward the raw body and all headers to the canonical handler
  const body = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const canonicalUrl = new URL('/api/webhooks/stripe', request.nextUrl.origin);

  const forwarded = await fetch(canonicalUrl.toString(), {
    method: 'POST',
    headers,
    body,
  });

  const responseBody = await forwarded.text();
  return new NextResponse(responseBody, {
    status: forwarded.status,
    headers: { 'Content-Type': forwarded.headers.get('Content-Type') || 'application/json' },
  });
}
