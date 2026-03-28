/**
 * JSON-LD structured data for property pages.
 * Outputs Schema.org LodgingBusiness + Place markup for Google rich results.
 */

import type { Location } from '@/types/location';

interface Props {
  location: Location;
}

export default function PropertyJsonLd({ location }: Props) {
  const primaryPhoto = location.images?.[0] || '';
  const url = `https://setvenue.com/locations/${location.id}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['LodgingBusiness', 'Place'],
    name: location.name,
    description: location.description,
    url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: location.address,
      addressLocality: location.city,
      addressRegion: location.state,
      postalCode: location.zip,
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
    priceRange: location.pricePerHour
      ? `From $${location.pricePerHour}/hr`
      : location.pricePerDay
        ? `From $${location.pricePerDay}/day`
        : undefined,
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
    ...(location.reviewRating && location.reviewCount
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
