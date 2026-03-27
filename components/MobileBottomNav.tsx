'use client';

import Link from 'next/link';
import { Heart, Home, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getFavoriteLocationIds, subscribeToFavorites } from '@/lib/favorites';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    setFavoriteCount(getFavoriteLocationIds().length);
    return subscribeToFavorites((favorites) => setFavoriteCount(favorites.length));
  }, []);

  const items = [
    { href: '/', label: 'Home', Icon: Home },
    { href: '/locations', label: 'Browse', Icon: Search },
    { href: '/favorites', label: 'Favorites', Icon: Heart, badge: favoriteCount },
    { href: '/login', label: 'Account', Icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-slate-200 bg-white lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile navigation"
    >
      {items.map(({ href, label, Icon, badge }) => {
        const isActive = pathname === href || (href === '/locations' && pathname.startsWith('/locations'));
        return (
          <Link
            key={href}
            href={href}
            className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors ${
              isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
            }`}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="relative">
              <Icon
                className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`}
              />
              {badge && badge > 0 ? (
                <span className="absolute -right-2 -top-1.5 inline-flex min-w-[16px] items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-bold leading-4 text-white">
                  {badge}
                </span>
              ) : null}
            </div>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
