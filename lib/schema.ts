import { Location } from '@/types/location';

export function generatePropertySchema(location: Location, url: string): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: location.name,
    description: `Production-ready location for film, events, and photo shoots in ${location.city}, ${location.state}`,
    url,
    image: location.images || [],
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.city,
      addressRegion: location.state,
      addressCountry: 'US',
    },
    priceRange: `$${location.pricePerHour}/hr`,
    priceCurrency: 'USD',
  };
}

export function generateOrganizationSchema(): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SetVenue',
    url: 'https://setvenue.com',
    description: 'Production location rental marketplace',
  };
}
