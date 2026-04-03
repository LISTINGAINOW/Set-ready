/**
 * JSON-LD structured data for property pages.
 * Outputs Schema.org Product + Place markup for Google rich results.
 */

import type { Location } from '@/types/location';

interface Props {
  location: Location;
}

export default function PropertyJsonLd({ location }: Props) {
  const primaryPhoto = location.images?.[0] || '';
  const url = `https://setvenue.com/locations/${location.id}`;

  // Determine pricing for offers
  const price = location.pricePerHour || location.pricePerDay;
  const priceUnit = location.pricePerHour ? 'hour' : 'day';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Product', 'Place'],
    name: location.name,
    description: location.description,
    url,
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.city,
      addressRegion: location.state,
      addressCountry: 'US',
    },
    ...(location.latitude && location.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: location.latitude,
            longitude: location.longitude,
          },
        }
      : {}),
    image: location.images?.slice(0, 6) || [primaryPhoto],
    photo: primaryPhoto
      ? {
          '@type': 'ImageObject',
          url: primaryPhoto,
          name: location.name,
        }
      : undefined,
    // Add offers with pricing if available
    ...(price
      ? {
          offers: {
            '@type': 'Offer',
            price: price.toFixed(2),
            priceCurrency: 'USD',
            priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            availability: 'https://schema.org/InStock',
            url,
            ...(priceUnit === 'hour'
              ? { eligibleQuantity: { '@type': 'QuantitativeValue', unitText: 'HUR', value: 1 } }
              : { eligibleQuantity: { '@type': 'QuantitativeValue', unitText: 'DAY', value: 1 } }),
          },
        }
      : {}),
    amenityFeature: location.amenities.map((a) => ({
      '@type': 'LocationFeatureSpecification',
      name: a,
      value: true,
    })),
    ...(location.beds
      ? {
          numberOfRooms: location.beds,
        }
      : {}),
    ...(location.sqft
      ? {
          floorSize: {
            '@type': 'QuantitativeValue',
            value: location.sqft,
            unitCode: 'FTK',
          },
        }
      : {}),
    ...(location.maxCapacity || location.maxGuests
      ? {
          maximumAttendeeCapacity: location.maxCapacity || location.maxGuests,
        }
      : {}),
    // Only include aggregateRating if reviews are verified
    ...(location.reviewsVerified && location.reviewRating && location.reviewCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: location.reviewRating,
            reviewCount: location.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: url,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      result: {
        '@type': 'Reservation',
        name: `Book ${location.name}`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
