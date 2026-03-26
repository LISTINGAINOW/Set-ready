# SetVenue Researcher Playbook

**Purpose:** Guide the nightly research agent on what to look for, quality standards, and how to score leads.
**Used by:** lead-research-competitors cron, researcher-self-improve cron, weekly-research-digest cron

---

## What Makes a Good Lead

### Property Management Companies (BEST)
**Score 8-10 if:**
- Manages 20+ properties
- Properties are in our target cities (LA, Atlanta, NYC, Austin, Miami, Nashville)
- Manages luxury, modern, or unique properties (not just standard apartments)
- Has a website with a contact email
- Has been in business 3+ years

**Score 5-7 if:**
- Manages 5-20 properties
- Properties are decent but not luxury
- Only has a phone number, no email
- In a target city

**Score 1-4 if:**
- Manages fewer than 5 properties
- Standard apartments/condos (not production-ready)
- Outside target cities
- No contact info found

### Airbnb/VRBO Superhosts
**Score 8-10 if:**
- Superhost/Premier Host badge
- Luxury property (4+ bedrooms, pool, modern design)
- 20+ photos on listing
- In a target city
- Multiple listings (manages several properties)

**Score 5-7 if:**
- Nice property but not luxury
- 10-20 photos
- Single listing
- Target city

**Score 1-4 if:**
- Basic apartment/condo
- Under 10 photos
- Not production-ready (small, cluttered, bad lighting)

### Real Estate Agents
**Score 8-10 if:**
- Specializes in luxury properties
- Works in target city
- Has team (multiplier effect)
- Active on social media (reachable)
- Sells $1M+ homes

**Score 5-7 if:**
- General residential agent
- Target city
- Has email

### Direct Owners
**Score 8-10 if:**
- Property is clearly production-ready (large, modern, great photos)
- Unique features (pool, ocean view, estate, warehouse, loft)
- In target city
- Contact info available

## What Makes a Property "Production-Ready"

Look for these features when evaluating:
- Large open spaces (living rooms, kitchens, outdoor areas)
- Good natural lighting (big windows, south-facing)
- Modern or distinctive design (not generic suburbia)
- Pool, rooftop, garden, or unique outdoor space
- 4+ bedrooms (for crew staging)
- Interesting architectural features
- Privacy (not overlooking neighbors)
- Parking for crew vehicles
- Location in a filming-friendly area

## Search Queries That Work

### Property Management Companies
- "[city] luxury property management company"
- "[city] vacation rental management company"
- "[city] short term rental property manager"
- "[city] estate management company"
- "property management company luxury homes [city]"
- site:linkedin.com "[city] property management" "luxury"

### Airbnb/VRBO Hosts
- Search Airbnb directly: filter by city, Superhost, 4+ beds, luxury
- "[city] luxury Airbnb host"
- "[city] vacation rental luxury estate"

### Real Estate Agents
- "luxury real estate agent [city]"
- "[city] high end real estate"
- site:zillow.com/profile "[city]" "luxury"

### Production-Ready Properties
- "[city] estate for rent film production"
- "[city] luxury home photo shoot rental"
- "[city] mansion event rental"
- Zillow/Redfin: filter 4+ bed, $1M+, pool, sort by most photos

## Search Queries That DON'T Work

Track these and stop using them:
- Generic "property management [city]" — returns too many apartment complexes
- "Film location [city]" — returns competitor listings, not leads
- "Rent my house for filming" — returns blog posts, not contacts

## Contact Enrichment Rules

When you find a lead, try to get email in this order:
1. Website contact page
2. Website about/team page (individual emails)
3. LinkedIn profile
4. Pattern guess: info@domain, hello@domain, firstname@domain
5. Google: "email" + company name
6. Google: "@domain.com" + company name

**Quality hierarchy:**
- Direct person email (john@company.com) = HIGH confidence
- Generic email (info@company.com) = MEDIUM confidence
- Pattern-guessed email = LOW confidence (needs MX verification)

**Never:**
- Use personal Gmail/Yahoo addresses found randomly
- Guess emails without MX verification
- Scrape emails from websites that say "do not email"

## Data Quality Standards

Every lead in the JSON must have:
- `company` or `name` (required)
- `city` (required)
- `type`: management | host | agent | owner (required)
- `source`: where you found them (required)
- `score`: 1-10 (required)

Should have:
- `email` (with confidence level)
- `phone`
- `website`
- `property_count` (for management companies)
- `notes` (why this lead is good)

## Cities — Priority Order

1. **Los Angeles** — #1 production market, our home base
2. **Atlanta** — #2 US production market (tax incentives)
3. **New York City** — massive market but competitive
4. **Austin** — growing fast, SXSW ecosystem
5. **Miami** — luxury market, music videos, fashion
6. **Nashville** — music industry, growing film scene

Spend 40% of research time on LA, 20% Atlanta, 15% NYC, 10% Austin, 10% Miami, 5% Nashville.

## Anti-Patterns (Don't Do These)

- Don't scrape the same sites every night — rotate sources
- Don't save leads with no contact info — useless
- Don't save apartment complexes as leads — not production-ready
- Don't duplicate leads from yesterday — check existing files first
- Don't scrape sites that block you — note the block and move on
- Don't generate fake/placeholder data — real leads only

---

*Update this playbook as we learn which search strategies and lead types convert best.*
