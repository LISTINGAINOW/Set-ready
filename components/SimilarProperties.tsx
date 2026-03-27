import type { Location } from '@/types/location';
import LocationCard from '@/components/LocationCard';
import { getAllProperties } from '@/lib/properties';

interface Props {
  currentId: string;
  city: string;
  style: string;
  maxResults?: number;
}

/**
 * Shows similar properties based on city match, then style match.
 * Excludes the current property.
 */
export default async function SimilarProperties({
  currentId,
  city,
  style,
  maxResults = 3,
}: Props) {
  const all = await getAllProperties();
  const others = all.filter((p) => p.id !== currentId);

  if (others.length === 0) return null;

  // Score each property by relevance
  const scored = others.map((p) => {
    let score = 0;
    if (p.city.toLowerCase() === city.toLowerCase()) score += 3;
    if (p.state === 'CA') score += 1; // Same state bonus
    if (p.style?.toLowerCase() === style?.toLowerCase()) score += 2;
    return { property: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const similar = scored.slice(0, maxResults).map((s) => s.property);

  if (similar.length === 0) return null;

  return (
    <section className="mt-16 border-t border-slate-100 pt-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          You might also like
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
          Similar locations
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {similar.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>
    </section>
  );
}
