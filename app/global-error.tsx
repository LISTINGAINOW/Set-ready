'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-20 text-center">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-8 w-8 text-red-500" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              SetVenue is temporarily unavailable
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              We&apos;re experiencing a critical error. Our team has been notified. Please try refreshing the page.
            </p>
            {error.digest && (
              <p className="mt-2 font-mono text-xs text-slate-400">
                Error ID: {error.digest}
              </p>
            )}
            <div className="mt-8 flex justify-center">
              <button
                onClick={reset}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Reload page
              </button>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              Need help?{' '}
              <a
                href="mailto:support@setvenue.com"
                className="font-medium text-blue-600 underline hover:text-blue-500"
              >
                Contact support
              </a>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
