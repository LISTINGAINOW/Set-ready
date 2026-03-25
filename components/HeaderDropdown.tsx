'use client';

import Link from 'next/link';
import { ChevronDown, Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const menuItems = [
  { href: '/locations', label: 'Browse Locations' },
  { href: '/list-property', label: 'List Your Property' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function HeaderDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex items-center gap-2 rounded-full border border-black bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:border-blue-500 hover:text-blue-600"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open site menu"
      >
        <Menu className="h-4 w-4" />
        <span>Menu</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-64 overflow-hidden rounded-[24px] border border-black/10 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
          <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-600">
            Explore SetVenue
          </div>
          <div className="flex flex-col">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-2xl px-3 py-3 text-sm font-medium text-black transition-colors hover:bg-blue-50 hover:text-blue-600"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
