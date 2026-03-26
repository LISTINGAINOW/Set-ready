'use client';

import Link from 'next/link';
import { Heart, Menu, Search, User, X } from 'lucide-react';
import Logo from '@/components/Logo';
import { useEffect, useState } from 'react';
import { getFavoriteLocationIds, subscribeToFavorites } from '@/lib/favorites';
import { usePathname, useRouter } from 'next/navigation';
import PWAInstall from '@/components/PWAInstall';

const navItems = [
  { href: '/locations', label: 'Browse' },
  { href: '/blog', label: 'Blog' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/list-property', label: 'Host' },
  { href: '/free-listing', label: 'Free listing' },
];

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }

    setFavoriteCount(getFavoriteLocationIds().length);
    return subscribeToFavorites((favorites) => setFavoriteCount(favorites.length));
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    setIsMobileMenuOpen(false);
    router.push(trimmedQuery ? `/search?q=${encodeURIComponent(trimmedQuery)}` : '/search');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/6 bg-white/88 backdrop-blur-xl supports-[backdrop-filter]:bg-white/72">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Logo href="/" size="md" showTagline className="min-w-0" />

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="text-sm font-medium text-slate-600 transition hover:text-slate-950">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden min-w-0 items-center gap-3 lg:flex">
            <form onSubmit={handleSearch} className="relative hidden xl:block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search locations"
                className="min-h-[44px] w-[280px] rounded-full border border-black/8 bg-white px-4 py-3 pl-11 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-200"
              />
            </form>

            <Link href="/favorites" className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/8 text-slate-700 transition hover:border-blue-200 hover:text-blue-600" aria-label="Favorites">
              <Heart className={`h-4 w-4 ${favoriteCount > 0 ? 'fill-blue-500 text-blue-500' : ''}`} />
              {favoriteCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {favoriteCount}
                </span>
              ) : null}
            </Link>

            <PWAInstall />

            {user ? (
              <div className="flex items-center gap-3">
                <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/8 text-slate-700 transition hover:border-blue-200 hover:text-blue-600" aria-label="Account">
                  <User className="h-5 w-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-black/8 px-4 py-2 text-sm font-medium text-slate-950 transition hover:border-blue-200 hover:text-blue-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="inline-flex min-h-[44px] items-center rounded-full px-2 text-sm font-medium text-slate-700 transition hover:text-slate-950">
                  Sign in
                </Link>
                <Link href="/register" className="inline-flex min-h-[44px] items-center rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600">
                  Get started
                </Link>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/8 text-slate-950 transition hover:border-blue-200 hover:text-blue-600 lg:hidden"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-site-menu"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div id="mobile-site-menu" className="mt-4 rounded-[28px] border border-black/8 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] lg:hidden">
            <form onSubmit={handleSearch} className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search locations"
                className="min-h-[48px] w-full rounded-full border border-black/8 bg-white py-3 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-200"
              />
            </form>

            <nav className="mt-5 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex min-h-[48px] items-center rounded-2xl px-3 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-50 hover:text-blue-600"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/favorites"
                className="flex min-h-[48px] items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-50 hover:text-blue-600"
              >
                <span>Favorites</span>
                {favoriteCount > 0 ? <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">{favoriteCount}</span> : null}
              </Link>
            </nav>

            <div className="mt-5 flex flex-col gap-3">
              <PWAInstall />
              {user ? (
                <>
                  <div className="rounded-2xl border border-black/8 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Signed in as {user.firstName}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="min-h-[48px] rounded-2xl border border-black/8 px-4 py-3 text-sm font-medium text-slate-950 transition hover:border-blue-200 hover:text-blue-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-black/8 px-4 py-3 text-sm font-medium text-slate-950 transition hover:border-blue-200 hover:text-blue-600">
                    Sign in
                  </Link>
                  <Link href="/register" className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
