// One-time seed script: inserts 4 properties from locations.json into Supabase
// Run with: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-properties.mjs
// Or set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

import { readFileSync } from 'fs';
import { resolve } from 'path';

let env = {};
try {
  const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
} catch { /* .env.local not present — use process.env */ }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const properties = [
  {
    folder_name: '7052-dume-dr-malibu',
    property_name: 'Point Dume Coastal Estate',
    address: '7052 Dume Dr',
    city: 'Malibu',
    state: 'CA',
    zip: '90265',
    beds: 6,
    baths: 8,
    property_type: 'SingleFamily',
    style: 'Contemporary',
    price_per_day: 4000,
    price_per_hour: 500,
    vibe: 'Secluded coastal luxury with sweeping ocean and mountain views. Resort-like sophistication meets complete privacy.',
    description: "Presented fully furnished, this highly secluded Point Dume retreat offers a rare blend of sophistication, privacy, and elevated coastal living. Meticulously renovated inside and out, the residence showcases exceptional craftsmanship, refined finishes, soaring ceilings, and sweeping ocean and mountain views throughout. Features include a grand two-story foyer, fireplace-adorned living room, formal dining room, family room with built-in bar, dual-sided aquarium, library/office, and a chef's kitchen with top-tier appliances. The upper level features five bedrooms highlighted by a spacious primary suite with ocean views, fireplace, private terrace, and spa-inspired bath. The lower level offers a private movie theater, gym, and secure safe room. Outdoor amenities include pool, spa, sun deck, built-in BBQ, fire pit lounge, and putting green.",
    amenities: ['Pool','Spa','Central Air','Fireplace','In-Unit Laundry','Movie Theater','Gym','Safe Room','BBQ','Fire Pit','Putting Green','Ocean Views','Mountain Views','Private Gate','2 Car Garage','15 Parking Spaces','Fully Furnished'],
    best_uses: ['Film Production','Photo Shoot','Events','Luxury Retreat','Corporate Retreat'],
    images: Array.from({length: 65}, (_, i) => `/images/properties/7052-dume-dr-malibu/${String(i+1).padStart(2,'0')}.webp`),
    featured: true,
    approved: true,
    status: 'active',
  },
  {
    folder_name: '2029-del-mar-heights-rd',
    property_name: 'Del Mar Coastal Contemporary',
    address: '2029 Del Mar Heights Rd',
    city: 'Del Mar',
    state: 'CA',
    zip: '92014',
    beds: 4,
    baths: 4,
    property_type: 'SingleFamily',
    style: 'Contemporary',
    price_per_day: null,
    price_per_hour: null,
    vibe: 'Newly rebuilt contemporary coastal home steps to the ocean in Del Mar.',
    description: "Newly rebuilt contemporary coastal home just 300 paces to the ocean in Del Mar. Steps from the sand in Del Mar Proper, this is one of the closest homes to Del Mar Beach and one of the very few properties permitted for short-term rentals. ADA-friendly with zero stairs from street, driveway, or garden. Expansive open-concept lower level features a supersized modern Italian kitchen with top-of-the-line oversized appliances, custom cabinetry, and dramatic entertaining space. Large openings lead to indoor-outdoor entertainment area with built-in seating, prep counters, and natural gas for BBQ and fire features. All four bedrooms are en-suite with bright, ultra-modern baths. Upstairs primary retreat offers two walk-in closets, spa-style bath, coffee/smoothie bar, and private ocean-view deck. Rear alley access provides parking for 7+ vehicles with potential ocean-view ADU expansion.",
    amenities: ['Ocean Views','Steps to Beach','ADA Accessible','Italian Kitchen','BBQ','Fire Features','Indoor-Outdoor Living','7+ Parking Spaces','2 Car Garage','Walk-in Closets','Spa Bath','Ocean View Deck','En-Suite Bedrooms','Laundry Room','Short-Term Rental Permitted'],
    best_uses: ['Monthly Rental','Corporate Retreat','Film Production','Photo Shoot','Luxury Vacation'],
    images: Array.from({length: 29}, (_, i) => `/images/properties/2029-del-mar-heights-rd/${String(i+1).padStart(2,'0')}.jpg`),
    featured: true,
    approved: true,
    status: 'active',
  },
  {
    folder_name: '6114-merritt-dr-malibu',
    property_name: 'Merritt Drive Malibu Estate',
    address: '6114 Merritt Dr',
    city: 'Malibu',
    state: 'CA',
    zip: '90265',
    beds: 6,
    baths: 6,
    property_type: 'SingleFamily',
    style: 'Conventional',
    price_per_day: 2000,
    price_per_hour: null,
    vibe: 'Sprawling hilltop Malibu estate with panoramic ocean, mountain, and treetop views.',
    description: "Sprawling 3.25-acre hilltop Malibu estate with panoramic ocean, mountain, and treetop views. This 6-bedroom, 6-bathroom retreat features soaring 9-foot ceilings, beamed ceilings, sunken living room, open floor plan, and multiple fireplaces. Gourmet kitchen with marble counters, kitchen island, double oven, and pantry. Spa with mountain views, detached guest house with in-law suite, barn/stable, and room for a tennis court. Security features include automatic gate and alarm system. Indoor-outdoor living with French doors, balcony, and expansive grounds including front yard, back yard, and horse property. Built-in BBQ, bar with ice maker, and formal dining room for world-class entertaining.",
    amenities: ['Ocean Views','Mountain Views','Panoramic Views','Spa','Guest House','Barn/Stable','Horse Property','3.25 Acres','Automatic Gate','Alarm System','Gourmet Kitchen','Marble Counters','Multiple Fireplaces','Sunken Living Room','High Ceilings','French Doors','Balcony','BBQ','Bar','Formal Dining','Detached Guest House','Room for Tennis Court'],
    best_uses: ['Monthly Rental','Film Production','Photo Shoot','Events','Luxury Retreat','Corporate Retreat'],
    images: Array.from({length: 9}, (_, i) => `/images/properties/6114-merritt-dr-malibu/${String(i+1).padStart(2,'0')}.webp`),
    featured: true,
    approved: true,
    status: 'active',
  },
  {
    folder_name: '600-lone-oak-dr-thousand-oaks',
    property_name: 'Lone Oak Ranch Estate',
    address: '600 Lone Oak Dr',
    city: 'Thousand Oaks',
    state: 'CA',
    zip: '91362',
    beds: 3,
    baths: 3,
    property_type: 'SingleFamily',
    style: 'Ranch',
    price_per_day: null,
    price_per_hour: 130,
    vibe: 'Stunning 12.52-acre ranch estate with panoramic city and mountain views.',
    description: "Stunning 12.52-acre ranch estate in Thousand Oaks with panoramic city and mountain views. This private retreat features 3 bedrooms, 3 bathrooms, a pool, fireplace, and tile roof on over 12 acres of rolling terrain. Perfect for events, productions, and gatherings up to 40 guests. The expansive grounds offer endless possibilities for outdoor filming, photo shoots, and private events with complete privacy and breathtaking vistas.",
    amenities: ['Pool','Fireplace','City Views','Mountain Views','12.52 Acres','Private','Tile Roof'],
    best_uses: ['Events','Film Production','Photo Shoot','Private Gatherings','Corporate Events','Weddings'],
    images: Array.from({length: 35}, (_, i) => `/images/properties/600-lone-oak-dr-thousand-oaks/${String(i+1).padStart(2,'0')}.webp`),
    featured: true,
    approved: true,
    status: 'active',
  },
];

async function seed() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/properties?on_conflict=folder_name`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(properties),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error('Seed failed:', res.status, text);
    process.exit(1);
  }
  console.log('Seed succeeded:', res.status, text || '(empty body — rows upserted)');
}

seed();
