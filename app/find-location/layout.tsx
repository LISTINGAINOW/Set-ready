import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Me a Location | SetVenue',
  description: 'Tell us what your production needs and our Location Concierge team will match you with 3–5 curated properties within 24 hours. No browsing required.',
  alternates: { canonical: '/find-location' },
  openGraph: {
    title: 'Find Me a Location | SetVenue',
    description: 'Tell us what your production needs and our Location Concierge team will match you with 3–5 curated properties within 24 hours.',
    url: 'https://setvenue.com/find-location',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Me a Location | SetVenue',
    description: 'Tell us what your production needs and our Location Concierge team will match you with 3–5 curated properties within 24 hours.',
  },
};

export default function FindLocationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
