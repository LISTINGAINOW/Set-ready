'use client';

export type SavedSearch = {
  id: string;
  name: string;
  query: string;
  createdAt: string;
  filters: Record<string, string>;
};

const KEY = 'setvenue-saved-searches';
const ALERT_LOG_KEY = 'setvenue-saved-search-alert-log';

export function getSavedSearches(): SavedSearch[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSearch(search: SavedSearch) {
  const existing = getSavedSearches();
  const next = [search, ...existing.filter((item) => item.id !== search.id)].slice(0, 10);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  logSearchAlert(`Saved search created: ${search.name} (${search.query || 'no filters'})`);
  return next;
}

export function removeSavedSearch(id: string) {
  const next = getSavedSearches().filter((item) => item.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function logSearchAlert(message: string) {
  const entry = { message, createdAt: new Date().toISOString() };
  const existing = typeof window === 'undefined' ? [] : JSON.parse(window.localStorage.getItem(ALERT_LOG_KEY) || '[]');
  window.localStorage.setItem(ALERT_LOG_KEY, JSON.stringify([entry, ...existing].slice(0, 20)));
}

export function getSavedSearchAlertLog() {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ALERT_LOG_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
