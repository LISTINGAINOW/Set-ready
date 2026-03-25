import type { MetadataRoute } from 'next';
import locationsData from '@/data/locations.json';
import type { Location } from '@/types/location';
import { getAllBlogPosts, isValidSlug } from '@/lib/blog';

const siteUrl = 'https://setvenue.com';
const staticRoutes = [
  '/',
  '/about',
  '/blog',
  '/contact',
  '/faq',
  '/how-it-works',
  '/list-property',
  '/locations',
  '/privacy',
  '/support',
  '/terms',
] as const;

const locations = locationsData as Location[];

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

      return {
        url: absoluteUrl,
        lastModified: now,
        changeFrequency: route === '/' ? 'weekly' : 'monthly',
        priority: route === '/' ? 1 : route === '/locations' ? 0.9 : 0.7,
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

  return [...staticPages, ...propertyPages, ...blogPages];
}
