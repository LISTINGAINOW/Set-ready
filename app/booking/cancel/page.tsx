'use client';

import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function BookingCancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Booking Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment was not processed. No charges have been made.
        </p>

        <div className="flex gap-3 justify-center">
          <Link
            href="/producer/search"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Browse Locations
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
