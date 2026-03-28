import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Earn with SetVenue — Film Location Rental Income Calculator',
  description: 'Calculate how much your property could earn as a film location. Compare SetVenue (0% host fees) vs Giggster and Peerspace. List your property for free.',
  alternates: { canonical: '/earn' },
  openGraph: {
    title: 'How Much Could Your Property Earn? | SetVenue',
    description: 'Film productions pay $150-$1,500/hr for the right space. With SetVenue, keep 100% of your rental income — no host fees ever.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How Much Could Your Property Earn? | SetVenue',
    description: 'Film productions pay $150-$1,500/hr for the right space. With SetVenue, keep 100% of your rental income — no host fees ever.',
  },
};

export default function EarnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
