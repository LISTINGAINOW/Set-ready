import type { MetadataRoute } from 'next';
import locationsData from '@/data/locations.json';
import type { Location } from '@/types/location';
import { getAllBlogPosts, isValidSlug } from '@/lib/blog';

const siteUrl = 'https://setvenue.com';
const staticRoutes = [
  '/',
  '/locations',
  '/cities',
  '/services',
  '/permits',
  '/search',
  '/compare',
  '/free-listing',
  '/list-property',
  '/find-location',
  '/for-productions',
  '/earn',
  '/about',
  '/blog',
  '/contact',
  '/faq',
  '/how-it-works',
  '/privacy',
  '/support',
  '/terms',
] as const;

const citySlugs = [
  'los-angeles',
  'new-york',
  'atlanta',
  'chicago',
  'miami',
  'nashville',
  'new-orleans',
  'austin',
  'san-francisco',
  'seattle',
  'portland',
  'denver',
  'salt-lake-city',
  'albuquerque',
  'santa-fe',
  'oklahoma-city',
  'savannah',
  'wilmington',
  'philadelphia',
  'pittsburgh',
  'detroit',
  'honolulu',
] as const;

const locations = locationsData as unknown as Location[];

type SitemapEntry = MetadataRoute.Sitemap[number];

function toAbsoluteUrl(path: string) {
  try {
    return new URL(path, siteUrl).toString();
  } catch {
    return null;
  }
}

function isSafeLocationId(id: string) {
  return /^[a-zA-Z0-9-]+$/.test(id);
}

function isSitemapEntry(entry: SitemapEntry | null): entry is SitemapEntry {
  return entry !== null;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = staticRoutes
    .map<SitemapEntry | null>((route) => {
      const absoluteUrl = toAbsoluteUrl(route);
      if (!absoluteUrl) return null;

      const highPriority = ['/locations', '/cities', '/services', '/permits', '/search', '/free-listing', '/list-property', '/find-location'];
      return {
        url: absoluteUrl,
        lastModified: now,
        changeFrequency: route === '/' ? 'weekly' : 'monthly',
        priority: route === '/' ? 1 : route === '/locations' ? 0.9 : highPriority.includes(route) ? 0.8 : 0.7,
      };
    })
    .filter(isSitemapEntry);

  const propertyPages = locations
    .filter((location) => typeof location.id === 'string' && isSafeLocationId(location.id))
    .map<SitemapEntry | null>((location) => {
      const absoluteUrl = toAbsoluteUrl(`/locations/${location.id}`);
      if (!absoluteUrl) return null;

      return {
        url: absoluteUrl,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      };
    })
    .filter(isSitemapEntry);

  const blogPages = getAllBlogPosts()
    .filter((post) => isValidSlug(post.slug))
    .map<SitemapEntry | null>((post) => {
      const absoluteUrl = toAbsoluteUrl(`/blog/${post.slug}`);
      if (!absoluteUrl) return null;

      return {
        url: absoluteUrl,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly',
        priority: 0.75,
      };
    })
    .filter(isSitemapEntry);

  const cityPages = citySlugs
    .map<SitemapEntry | null>((slug) => {
      const absoluteUrl = toAbsoluteUrl(`/cities/${slug}`);
      if (!absoluteUrl) return null;
      return {
        url: absoluteUrl,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.75,
      };
    })
    .filter(isSitemapEntry);

  return [...staticPages, ...propertyPages, ...cityPages, ...blogPages];
}
