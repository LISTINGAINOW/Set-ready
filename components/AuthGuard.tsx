'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface StoredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified?: boolean;
}

interface AuthGuardProps {
  children: React.ReactNode;
  requireVerified?: boolean;
  unverifiedTitle?: string;
  unverifiedMessage?: string;
}

export default function AuthGuard({
  children,
  requireVerified = true,
  unverifiedTitle = 'Please verify your email before continuing.',
  unverifiedMessage = 'You’re signed in, but your account still needs verification. Open the verification link we sent and come back once it’s confirmed.',
}: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'unauthenticated' | 'unverified' | 'ready'>('loading');
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      setStatus('unauthenticated');
      router.replace(`/login?redirect=${encodeURIComponent(pathname || '/dashboard')}`);
      return;
    }

    try {
      const parsed = JSON.parse(storedUser) as StoredUser;
      setUser(parsed);

      if (requireVerified && !parsed.emailVerified) {
        setStatus('unverified');
        return;
      }

      setStatus('ready');
    } catch {
      localStorage.removeItem('user');
      setStatus('unauthenticated');
      router.replace(`/login?redirect=${encodeURIComponent(pathname || '/dashboard')}`);
    }
  }, [pathname, requireVerified, router]);

  const verificationHref = useMemo(() => {
    if (!user?.email) return '/verify-email';
    return `/verify-email?email=${encodeURIComponent(user.email)}`;
  }, [user?.email]);

  if (status === 'loading') {
    return <div className="bg-[#F9FAFB] p-8 text-center text-blue-500">Checking your account…</div>;
  }

  if (status === 'unverified') {
    return (
      <div className="bg-[#F9FAFB] px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border-2 border-[#3B82F6] bg-white p-8 text-black shadow-[0_20px_60px_rgba(59,130,246,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">Email verification required</p>
          <h1 className="mt-3 text-3xl font-bold text-[#111111]">{unverifiedTitle}</h1>
          <p className="mt-4 text-[#222222]">{unverifiedMessage}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={verificationHref} className="rounded-full bg-[#3B82F6] px-5 py-3 font-semibold text-white transition hover:bg-blue-600">
              Verify my email
            </Link>
            <Link href="/login" className="rounded-full border-2 border-black bg-white px-5 py-3 font-semibold text-black transition hover:border-[#3B82F6] hover:text-[#3B82F6]">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status !== 'ready') {
    return null;
  }

  return <>{children}</>;
}
