'use client';

import Link from 'next/link';
import { Heart, Menu, Search, X } from 'lucide-react';
import Logo from '@/components/Logo';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getFavoriteLocationIds, subscribeToFavorites } from '@/lib/favorites';
import { usePathname, useRouter } from 'next/navigation';
import PWAInstall from '@/components/PWAInstall';

const primaryNav = [
  { href: '/locations', label: 'Browse' },
  { href: '/services', label: 'Services' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/blog', label: 'Blog' },
];

const listingNav = [
  { href: '/list-property', label: 'Host' },
  { href: '/free-listing', label: 'List Free' },
];

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    if (isMobileMenuOpen && drawerRef.current) {
      const firstFocusable = drawerRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
    if (!isMobileMenuOpen && hamburgerRef.current) {
      hamburgerRef.current.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleDrawerKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !drawerRef.current) return;
    const focusable = Array.from(
      drawerRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }, []);

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

  const userInitials = user?.firstName ? user.firstName[0].toUpperCase() : null;

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white/88 backdrop-blur-xl supports-[backdrop-filter]:bg-white/72 transition-all duration-300 ${
          isScrolled ? 'shadow-sm border-b border-slate-200' : 'border-b border-black/6'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4 lg:h-16">
            <Logo href="/" size="md" showTagline className="min-w-0" />

            {/* Desktop nav */}
            <nav className="hidden items-center gap-5 lg:flex">
              {[...primaryNav, ...listingNav].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`whitespace-nowrap text-sm font-medium transition hover:text-blue-600 ${
                    pathname === item.href ? 'text-blue-600' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/find-location"
                className="inline-flex min-h-[36px] items-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Find a Location
              </Link>
            </nav>

            {/* Desktop right side */}
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

              <Link
                href="/favorites"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/8 text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
                aria-label="Favorites"
              >
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
                  <Link
                    href="/dashboard/owner"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500"
                    aria-label={`Account: ${user.firstName}`}
                    title={`Hi, ${user.firstName} — View Dashboard`}
                  >
                    {userInitials}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex min-h-[44px] items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-blue-200 hover:text-blue-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="inline-flex min-h-[44px] items-center rounded-full px-2 text-sm font-medium text-slate-700 transition hover:text-slate-950"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex min-h-[44px] items-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-blue-600 hover:text-white hover:border-blue-600"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              ref={hamburgerRef}
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/8 text-slate-950 transition hover:border-blue-200 hover:text-blue-600 lg:hidden"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-site-menu"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Slide-in panel */}
      <div
        ref={drawerRef}
        id="mobile-site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!isMobileMenuOpen}
        onKeyDown={handleDrawerKeyDown}
        className={`fixed inset-y-0 right-0 z-[70] flex w-[85vw] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {userInitials}
              </div>
              <span className="text-sm font-medium text-slate-900">Hi, {user.firstName}</span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-slate-900">Menu</span>
          )}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative mb-6">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search locations"
              className="min-h-[48px] w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
            />
          </form>

          {/* Primary nav */}
          <div className="mb-5">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Explore</p>
            <nav className="flex flex-col gap-0.5">
              {primaryNav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex min-h-[48px] items-center rounded-xl px-3 text-sm font-medium transition ${
                    pathname === item.href ? 'bg-blue-50 text-blue-600' : 'text-slate-900 hover:bg-slate-50 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/favorites"
                className={`flex min-h-[48px] items-center justify-between rounded-xl px-3 text-sm font-medium transition ${
                  pathname === '/favorites' ? 'bg-blue-50 text-blue-600' : 'text-slate-900 hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                <span>Favorites</span>
                {favoriteCount > 0 ? (
                  <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">{favoriteCount}</span>
                ) : null}
              </Link>
            </nav>
          </div>

          {/* List your property */}
          <div className="mb-6">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">List Your Property</p>
            <nav className="flex flex-col gap-0.5">
              {listingNav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex min-h-[48px] items-center rounded-xl px-3 text-sm font-medium transition ${
                    pathname === item.href ? 'bg-blue-50 text-blue-600' : 'text-slate-900 hover:bg-slate-50 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* CTA */}
          <Link
            href="/find-location"
            className="flex min-h-[48px] items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Find a Location
          </Link>
        </div>

        {/* Account section */}
        <div className="border-t border-slate-100 px-4 py-4">
          <PWAInstall />
          {user ? (
            <button
              onClick={handleLogout}
              className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-xl border border-slate-200 text-sm font-medium text-slate-900 transition hover:border-blue-200 hover:text-blue-600"
            >
              Sign out
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-200 text-sm font-medium text-slate-900 transition hover:border-blue-200 hover:text-blue-600"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 transition hover:bg-blue-600 hover:text-white hover:border-blue-600"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
