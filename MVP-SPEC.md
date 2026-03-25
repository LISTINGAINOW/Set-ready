# SetVenue — Production Marketplace MVP Spec

**Product Name:** SetVenue  
**Tagline:** Locations. Stays. Events. One platform.

A production marketplace connecting property owners with filmmakers, photographers, event planners, and production professionals seeking short-term location rentals.

---

## Core Value Proposition

- **One platform** for locations, crew housing, and events
- **Lower fees** — 10% vs Giggster's 15-25%
- **Production-first design** — Built for production workflows
- **0% host fees** — Only guests pay the platform fee

---

## MVP Feature Set

### For Production Teams (Guests)

| Feature | Description |
|---------|-------------|
| **Browse locations** | Filter by type, price, amenities |
| **Book stays** | Crew housing and accommodations |
| **Book events** | Wrap parties, launches, gatherings |
| **Insurance verification** | Upload certificate or use partner link |
| **Secure payment** | Stripe integration |

### For Property Owners (Hosts)

| Feature | Description |
|---------|-------------|
| **Create listings** | Photos, descriptions, pricing, availability |
| **Set privacy tiers** | Public, Private, NDA required |
| **Approve bookings** | Review and approve/decline requests |
| **0% host fees** | Keep all earnings from bookings |

### Platform

| Feature | Description |
|---------|-------------|
| **Dual-role dashboard** | Guest & Host views |
| **Real-time booking** | Request/approval flow |
| **Admin oversight** | Platform management |
| **Legal templates** | Location release, NDA, production agreement |

---

## Technical Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **Database:** JSON-file (MVP) → Supabase (production)
- **Payments:** Stripe
- **Storage:** Cloudflare R2 / S3 (photos)
- **Auth:** NextAuth.js

---

## Competitive Positioning

| Platform | Focus | Fee |
|----------|-------|-----|
| **SetVenue** | **All three** | **10%** |
| Giggster | Locations only | 15-25% |
| Peerspace | Events primarily | ~20% |
| Airbnb | Accommodation | 3-15% (hosts often reject productions) |

---

## Target Users

**Demand Side:**
- Film production companies
- Photography studios
- Commercial producers
- Event planners
- Content creators

**Supply Side:**
- Property owners
- Property managers
- Real estate investors
- Existing location libraries

---

## Privacy Tiers

| Tier | Description |
|------|-------------|
| **Public** | Full listing visibility |
| **Private** | Limited identifying info until inquiry |
| **NDA Required** | Pre-booking confidentiality agreement |

---

## Pricing Model

- **Guest fee:** 10%
- **Host fee:** 0%
- **Minimum booking:** $49

---

## Launch Milestones

1. Form LLC, open business bank account
2. Integrate Stripe
3. Launch with 50+ listings
4. First 10 bookings
5. First paying customer

---

*Last updated: March 23, 2026*
