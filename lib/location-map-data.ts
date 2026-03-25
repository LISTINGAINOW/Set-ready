import { Location } from '@/types/location';

export type LocationCoordinates = {
  lat: number;
  lng: number;
  areaLabel: string;
};

const cityCoordinateMap: Record<string, LocationCoordinates> = {
  'Los Angeles, CA': { lat: 34.0522, lng: -118.2437, areaLabel: 'Los Angeles core' },
  'West Hollywood, CA': { lat: 34.0901, lng: -118.3617, areaLabel: 'West Hollywood' },
  'Malibu, CA': { lat: 34.0259, lng: -118.7798, areaLabel: 'Malibu coast' },
  'Ventura, CA': { lat: 34.2746, lng: -119.229, areaLabel: 'Ventura coast' },
  'Topanga, CA': { lat: 34.0922, lng: -118.6059, areaLabel: 'Topanga canyon' },
  'Venice, CA': { lat: 33.985, lng: -118.4695, areaLabel: 'Venice beach' },
  'Hollywood, CA': { lat: 34.0983, lng: -118.3267, areaLabel: 'Hollywood' },
  'Joshua Tree, CA': { lat: 34.1347, lng: -116.3131, areaLabel: 'Joshua Tree desert' },
  'Brooklyn, NY': { lat: 40.6782, lng: -73.9442, areaLabel: 'Brooklyn' },
};

const keywordOverrides: Array<{ keywords: string[]; coords: LocationCoordinates }> = [
  { keywords: ['silver lake'], coords: { lat: 34.0862, lng: -118.2702, areaLabel: 'Silver Lake' } },
  { keywords: ['downtown la', 'dtla', 'arts district'], coords: { lat: 34.0407, lng: -118.2331, areaLabel: 'Downtown Los Angeles' } },
  { keywords: ['laurel canyon'], coords: { lat: 34.1206, lng: -118.3806, areaLabel: 'Laurel Canyon' } },
  { keywords: ['hillside'], coords: { lat: 34.1003, lng: -118.3912, areaLabel: 'Los Angeles hillside' } },
  { keywords: ['venice beach', 'ocean front'], coords: { lat: 33.985, lng: -118.4695, areaLabel: 'Venice Beach' } },
  { keywords: ['sunset strip'], coords: { lat: 34.0928, lng: -118.3762, areaLabel: 'Sunset Strip' } },
  { keywords: ['malibu beachfront', 'coast highway'], coords: { lat: 34.0363, lng: -118.6777, areaLabel: 'Malibu beachfront' } },
  { keywords: ['joshua tree', 'desert'], coords: { lat: 34.1381, lng: -116.3136, areaLabel: 'Joshua Tree' } },
  { keywords: ['brooklyn'], coords: { lat: 40.6782, lng: -73.9442, areaLabel: 'Brooklyn' } },
];

function hashString(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getLocationCoordinates(location: Location): LocationCoordinates {
  const searchText = [location.title, location.address, location.neighborhood, location.city, location.state]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const override = keywordOverrides.find(({ keywords }) => keywords.some((keyword) => searchText.includes(keyword)));
  const base = override?.coords || cityCoordinateMap[`${location.city}, ${location.state}`] || { lat: 34.0522, lng: -118.2437, areaLabel: location.city };

  const seed = hashString(`${location.id}-${location.title}-${location.address}`);
  const latOffset = ((seed % 11) - 5) * 0.004;
  const lngOffset = (((Math.floor(seed / 11)) % 11) - 5) * 0.004;

  return {
    lat: Number((base.lat + latOffset).toFixed(5)),
    lng: Number((base.lng + lngOffset).toFixed(5)),
    areaLabel: override?.coords.areaLabel || base.areaLabel,
  };
}
