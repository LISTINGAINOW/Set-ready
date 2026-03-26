import Link from 'next/link';

const legalLinks = [
  { href: '/legal/terms', label: 'Terms of Service' },
  { href: '/legal/privacy', label: 'Privacy Policy' },
  { href: '/legal/owner-agreement', label: 'Owner Agreement' },
  { href: '/legal/cancellation', label: 'Cancellation Policy' },
  { href: '/legal/disputes', label: 'Dispute Resolution' },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        {/* Mobile / tablet nav — horizontal scrollable tabs */}
        <nav className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden" aria-label="Legal pages">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/70 transition hover:border-blue-300 hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10 xl:grid-cols-[240px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Legal</p>
              <nav className="flex flex-col gap-1" aria-label="Legal pages">
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-[12px] px-3 py-2.5 text-sm font-medium text-black/70 transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Page content */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
