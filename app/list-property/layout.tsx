import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'List Your Property | SetVenue',
  description: 'Earn money hosting film shoots, photo sessions, and productions. List your property on SetVenue — free to join, transparent pricing, and full host control.',
  alternates: { canonical: '/list-property' },
  openGraph: {
    title: 'List Your Property | SetVenue',
    description: 'Earn money hosting film shoots, photo sessions, and productions. Free to join, full host control.',
    url: 'https://setvenue.com/list-property',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'List Your Property | SetVenue',
    description: 'Earn money hosting film shoots, photo sessions, and productions. Free to join, full host control.',
  },
};

export default function ListPropertyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
