/**
 * Site-wide Organization structured data for Google Knowledge Panel.
 */

export default function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SetVenue',
    legalName: 'Set Venue LLC',
    url: 'https://setvenue.com',
    logo: 'https://setvenue.com/logos/concept-5.svg',
    description:
      'Premium film location rentals, photo shoot venues, and production spaces. 0% host fees. Lower costs than Giggster or Peerspace.',
    foundingDate: '2026-03-23',
    founder: {
      '@type': 'Person',
      name: 'Joshua Feuer',
    },
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'CA',
      addressCountry: 'US',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'noreply@setvenue.com',
      url: 'https://setvenue.com/contact',
    },
    sameAs: ['https://x.com/SetVenueHQ'],
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    knowsAbout: [
      'Film location scouting',
      'Production venue rentals',
      'Photo shoot locations',
      'Event venue booking',
      'Crew housing',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
