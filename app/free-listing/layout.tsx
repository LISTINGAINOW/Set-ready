import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'List Your Property Free | SetVenue',
  description: 'List your home, loft, or studio on SetVenue for free. Keep 100% of your earnings. No upfront fees — reach production crews, photographers, and event planners looking for unique spaces.',
  alternates: { canonical: '/free-listing' },
  openGraph: {
    title: 'List Your Property Free | SetVenue',
    description: 'Keep 100% of your earnings. No upfront fees — reach production crews, photographers, and event planners.',
    url: 'https://setvenue.com/free-listing',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'List Your Property Free | SetVenue',
    description: 'Keep 100% of your earnings. No upfront fees — reach production crews, photographers, and event planners.',
  },
};

export default function FreeListingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
