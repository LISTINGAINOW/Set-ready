import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AIAssistant from '@/components/AIAssistant';
import PWARegister from '@/components/PWARegister';
import SessionSecurity from '@/components/SessionSecurity';
import { ToastProvider } from '@/components/ui/toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const siteUrl = 'https://setvenue.com';
const defaultTitle = 'SetVenue - Production Locations, Crew Stays & Event Venues';
const defaultDescription = 'Find and book locations for film, photo shoots, events, and production crew housing. One platform for locations, stays, and venues. Lower fees than Giggster.';
const defaultKeywords = [
  'location rental',
  'film locations',
  'photo shoot locations',
  'production locations',
  'crew housing',
  'event venues',
  'production space',
  'LA locations',
  'Giggster alternative',
];
const defaultOgImage = '/icons/icon-512.png';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: '%s | SetVenue',
  },
  description: defaultDescription,
  keywords: defaultKeywords,
  applicationName: 'SetVenue',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    type: 'website',
    url: siteUrl,
    siteName: 'SetVenue',
    images: [
      {
        url: defaultOgImage,
        width: 512,
        height: 512,
        alt: defaultTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: [defaultOgImage],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'SetVenue',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/icons/logo.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/icons/logo.svg'],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <Script
          defer
          data-domain="setvenue.com"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
        <ToastProvider>
          <PWARegister />
          <SessionSecurity />
          <Header />
          {children}
          <Footer />
          <AIAssistant />
        </ToastProvider>
      </body>
    </html>
  );
}
