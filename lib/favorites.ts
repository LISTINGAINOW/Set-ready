'use client';

const FAVORITES_STORAGE_KEY = 'guest-favorite-location-ids';
const FAVORITES_UPDATED_EVENT = 'favorites-updated';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getFavoriteLocationIds(): string[] {
  if (!isBrowser()) return [];

  try {
    const stored = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function saveFavoriteLocationIds(ids: string[]) {
  if (!isBrowser()) return;

  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT, { detail: ids }));
}

export function isLocationFavorited(locationId: string) {
  return getFavoriteLocationIds().includes(locationId);
}

export function toggleFavoriteLocation(locationId: string) {
  const favorites = getFavoriteLocationIds();
  const nextFavorites = favorites.includes(locationId)
    ? favorites.filter((id) => id !== locationId)
    : [...favorites, locationId];

  saveFavoriteLocationIds(nextFavorites);
  return nextFavorites;
}

export function removeFavoriteLocation(locationId: string) {
  const nextFavorites = getFavoriteLocationIds().filter((id) => id !== locationId);
  saveFavoriteLocationIds(nextFavorites);
  return nextFavorites;
}

export function subscribeToFavorites(callback: (favorites: string[]) => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handleFavoritesUpdated = (event: Event) => {
    const customEvent = event as CustomEvent<string[]>;
    callback(customEvent.detail || getFavoriteLocationIds());
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === FAVORITES_STORAGE_KEY) {
      callback(getFavoriteLocationIds());
    }
  };

  window.addEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdated as EventListener);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdated as EventListener);
    window.removeEventListener('storage', handleStorage);
  };
}
