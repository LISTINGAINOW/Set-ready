'use client';

const KEY = 'setvenue-compare-list';
const LIMIT = 4;

type Subscriber = (ids: string[]) => void;
const subscribers = new Set<Subscriber>();

function readIds() {
  if (typeof window === 'undefined') return [] as string[];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string').slice(0, LIMIT) : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  window.localStorage.setItem(KEY, JSON.stringify(ids.slice(0, LIMIT)));
  subscribers.forEach((subscriber) => subscriber(ids.slice(0, LIMIT)));
}

export function getComparedLocationIds() {
  return readIds();
}

export function toggleComparedLocation(id: string) {
  const ids = readIds();
  const next = ids.includes(id) ? ids.filter((entry) => entry !== id) : [...ids, id].slice(0, LIMIT);
  writeIds(next);
  return next;
}

export function clearComparedLocations() {
  writeIds([]);
}

export function subscribeToComparedLocations(subscriber: Subscriber) {
  subscribers.add(subscriber);
  return () => {
    subscribers.delete(subscriber);
  };
}
