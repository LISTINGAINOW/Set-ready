import locationsData from '@/data/locations.json';
import type { Location } from '@/types/location';

export const locations: Location[] = locationsData as Location[];

export function normalizeSearchValue(value: string) {
  return value.toLowerCase().trim();
}

export function getLocationSearchText(location: Location) {
  return [
    location.name,
    location.city,
    location.state,
    location.address,
    location.description,
    location.propertyType,
    location.style,
    location.amenities.join(' '),
    (location.bestUses || []).join(' '),
    location.vibe || '',
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
