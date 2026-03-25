import locationsData from '@/data/locations.json';
import type { Location } from '@/types/location';

export const locations: Location[] = locationsData as Location[];

export function normalizeSearchValue(value: string) {
  return value.toLowerCase().trim();
}

export function getLocationSearchText(location: Location) {
  return [
    location.title,
    location.city,
    location.state,
    location.address,
    location.description,
    location.neighborhood,
    location.privacyTier,
    location.propertyType,
    location.amenities.join(' '),
    location.contentTypes.join(' '),
    (location.specialFeatures || []).join(' '),
    (location.features || []).join(' '),
    (location.tags || []).join(' '),
    (location.styleTags || []).join(' '),
    (location.accessOptions || []).join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function searchLocations(query: string, source: Location[] = locations) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return source;
  }

  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

  return source.filter((location) => {
    const searchText = getLocationSearchText(location);

    return queryTerms.every((term) => searchText.includes(term));
  });
}
