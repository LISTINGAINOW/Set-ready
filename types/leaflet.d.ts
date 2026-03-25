import 'leaflet';

declare module 'leaflet' {
  export type LatLngExpression = [number, number] | { lat: number; lng: number } | { lat: number; lon: number };
}
