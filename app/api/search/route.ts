import { NextRequest, NextResponse } from 'next/server';
import { getAllProperties } from '@/lib/properties';
import { getLocationSearchText } from '@/lib/search';

function parseList(v: string | null): string[] {
  if (!v) return [];
  return v.split(',').map((s) => s.trim()).filter(Boolean);
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const q = sp.get('q') || '';
  const city = sp.get('city') || '';
  const propertyTypes = parseList(sp.get('propertyType'));
  const productionTypes = parseList(sp.get('productionType'));
  const priceMinRaw = sp.get('priceMin');
  const priceMaxRaw = sp.get('priceMax');
  const priceMin = priceMinRaw ? Number(priceMinRaw) : null;
  const priceMax = priceMaxRaw ? Number(priceMaxRaw) : null;
  const bedsRaw = sp.get('beds');
  const beds = bedsRaw && bedsRaw !== 'Any' ? Number(bedsRaw) : null;
  const bathsRaw = sp.get('baths');
  const baths = bathsRaw && bathsRaw !== 'Any' ? Number(bathsRaw) : null;
  const capacityRaw = sp.get('capacity');
  const capacity = capacityRaw && capacityRaw !== 'Any' ? Number(capacityRaw) : null;
  const amenities = parseList(sp.get('amenities'));
  const sort = sp.get('sort') || 'newest';

  let results = await getAllProperties();

  if (q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    results = results.filter((loc) => {
      const text = getLocationSearchText(loc);
      return terms.every((t) => text.includes(t));
    });
  }

  if (city) {
    results = results.filter((loc) => loc.city.toLowerCase() === city.toLowerCase());
  }

  if (propertyTypes.length > 0) {
    results = results.filter((loc) =>
      propertyTypes.some((t) => loc.propertyType.toLowerCase() === t.toLowerCase())
    );
  }

  if (productionTypes.length > 0) {
    results = results.filter((loc) =>
      productionTypes.some((pt) =>
        (loc.bestUses || []).some((u) => u.toLowerCase().includes(pt.toLowerCase()))
      )
    );
  }

  if (priceMin !== null && !isNaN(priceMin)) {
    results = results.filter((loc) => loc.pricePerHour >= priceMin);
  }
  if (priceMax !== null && !isNaN(priceMax)) {
    results = results.filter((loc) => loc.pricePerHour <= priceMax);
  }

  if (beds !== null && !isNaN(beds)) {
    results = results.filter((loc) => loc.beds >= beds);
  }
  if (baths !== null && !isNaN(baths)) {
    results = results.filter((loc) => loc.baths >= baths);
  }
  if (capacity !== null && !isNaN(capacity)) {
    results = results.filter((loc) => (loc.maxCapacity || loc.maxGuests || 0) >= capacity);
  }

  if (amenities.length > 0) {
    results = results.filter((loc) =>
      amenities.every((a) =>
        loc.amenities.some((la) => la.toLowerCase().includes(a.toLowerCase()))
      )
    );
  }

  switch (sort) {
    case 'price-asc':
      results = results.sort((a, b) => a.pricePerHour - b.pricePerHour);
      break;
    case 'price-desc':
      results = results.sort((a, b) => b.pricePerHour - a.pricePerHour);
      break;
    case 'beds-desc':
      results = results.sort((a, b) => b.beds - a.beds);
      break;
  }

  return NextResponse.json({ results, total: results.length });
}
