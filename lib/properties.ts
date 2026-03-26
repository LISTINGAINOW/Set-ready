import { createClient } from '@/utils/supabase/server';
import locationsData from '@/data/locations.json';
import { Location } from '@/types/location';

type DbProperty = {
  id: string;
  folder_name: string;
  property_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  property_type: string;
  style: string;
  vibe: string | null;
  price_per_day: number | null;
  price_per_hour: number | null;
  description: string;
  amenities: string[];
  best_uses: string[];
  images: string[];
  featured: boolean;
  approved: boolean;
  status: string;
  tot_license_number?: string | null;
  business_license_number?: string | null;
  business_license_type?: string | null;
  has_liability_insurance?: boolean | null;
  has_production_insurance?: boolean | null;
};

function toLocation(p: DbProperty): Location {
  const slug = p.folder_name;
  return {
    id: slug,
    name: p.property_name,
    slug,
    address: p.address,
    city: p.city,
    state: p.state,
    zip: p.zip,
    beds: p.beds,
    baths: p.baths,
    sqft: 0,
    propertyType: p.property_type,
    style: p.style,
    pricePerDay: p.price_per_day ?? 0,
    pricePerHour: p.price_per_hour ?? 0,
    description: p.description,
    amenities: p.amenities ?? [],
    bestUses: p.best_uses ?? [],
    images: p.images ?? [],
    featured: p.featured,
    approved: p.approved,
    status: p.status,
    totLicenseNumber: p.tot_license_number ?? undefined,
    businessLicenseNumber: p.business_license_number ?? undefined,
    businessLicenseType: p.business_license_type ?? undefined,
    hasLiabilityInsurance: p.has_liability_insurance ?? false,
    hasProductionInsurance: p.has_production_insurance ?? false,
  };
}

const fallback = locationsData as unknown as Location[];

export async function getAllProperties(): Promise<Location[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('approved', true)
      .eq('status', 'active');

    if (error || !data?.length) return fallback;
    return (data as DbProperty[]).map(toLocation);
  } catch {
    return fallback;
  }
}

export async function getFeaturedProperties(): Promise<Location[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('approved', true)
      .eq('status', 'active')
      .eq('featured', true)
      .limit(6);

    if (error || !data?.length) {
      return fallback.filter((l) => l.featured).slice(0, 6);
    }
    return (data as DbProperty[]).map(toLocation);
  } catch {
    return fallback.filter((l) => l.featured).slice(0, 6);
  }
}

export async function getPropertyBySlug(slug: string): Promise<Location | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('folder_name', slug)
      .eq('approved', true)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      return fallback.find((l) => l.slug === slug) ?? null;
    }
    return toLocation(data as DbProperty);
  } catch {
    return fallback.find((l) => l.slug === slug) ?? null;
  }
}
