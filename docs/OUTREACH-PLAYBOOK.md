# SetVenue Outreach Playbook

**Last updated:** March 25, 2026
**Goal:** Fill 500 free listings in 6 months
**Status:** 4 / 500 filled

---

## The Offer

- Free listing for 6 months (first 500 only)
- No credit card, no commitment
- Owner keeps 100% of their rental price
- We charge the renter a 10% booking fee
- Competitors (Giggster) charge owners 15-25%

## Key Selling Points

Use these in every conversation:

1. **"You keep 100%"** — we charge the renter, not you
2. **"Production bookings pay 2-5x vacation rental rates"** — bigger money per booking
3. **"Daytime only, less wear and tear"** — most shoots don't need overnight
4. **"You're already set up"** — for Airbnb/VRBO hosts, zero extra work
5. **"First 500 free"** — urgency, scarcity, FOMO
6. **"10 minutes to list"** — low friction
7. **"Giggster charges 15-25%, we charge 0%"** — direct competitor comparison

## Target Priority (in order)

### 🥇 Tier 1: Property Management Companies
- **Why:** One deal = 20-100 properties
- **Template:** `cold-outreach-management`
- **Where to find:** Google "property management [city]", LinkedIn, Yelp
- **Cities:** LA, Atlanta, NYC, Austin, Miami, Nashville
- **Pitch angle:** "Extra revenue from days properties sit empty"

### 🥈 Tier 2: Airbnb/VRBO Superhosts
- **Why:** Already set up for short-term rental, easy convert
- **Template:** `cold-outreach-host`
- **Where to find:** Airbnb search (luxury, 10+ photos, superhost badge), VRBO
- **Pitch angle:** "Additional revenue channel, zero extra work"

### 🥉 Tier 3: Real Estate Agents
- **Why:** Referral multiplier — they know dozens of owners
- **Template:** `cold-outreach-agent`
- **Where to find:** Zillow agent profiles, Realtor.com, LinkedIn
- **Pitch angle:** "Help your clients earn more from their properties"

### Tier 4: Direct Property Owners
- **Why:** Highest quality but slowest
- **Template:** `cold-outreach-owner`
- **Where to find:** Zillow/Redfin (luxury homes), Google Maps, driving neighborhoods
- **Pitch angle:** "Your property could earn from shoots you'd never know about"

## Email Sequence

| Day | Template | Purpose |
|-----|----------|---------|
| 0 | Cold outreach (owner/agent/management/host) | First touch |
| 3 | follow-up-1 | Bump — "did you see my note?" |
| 7 | follow-up-2 | Last chance — urgency |

**Rules:**
- Max 50 emails/day (Resend free tier)
- Never email the same person twice in 48 hours
- Stop sequence if they reply (positive OR negative)
- Track everything in send-log.json

## Subject Line A/B Tests

Each template has a `subject` and `subject_b`. Alternate between them:
- Odd-numbered sends → subject A
- Even-numbered sends → subject B
- Track open rates if possible, double down on winner

## Objection Handling

**"I already use Giggster/Peerspace"**
→ "Great — you already know the market. We're an additional channel with lower fees. List on both and see which performs better."

**"I don't want strangers in my house"**
→ "Totally understand. Production crews are professional — they carry insurance, sign agreements, and treat properties carefully. Plus you approve every booking."

**"Sounds too good to be free"**
→ "It's our launch offer. We're building inventory so production companies have enough options to book through us. After 500 properties, standard pricing applies."

**"I don't have time to manage another platform"**
→ "Listing takes 10 minutes. After that, bookings come to you via email — accept or decline. That's it."

**"What about insurance/liability?"**
→ "Renters are required to carry production insurance. We also have a dispute resolution process. Your property is protected."

## Tracking

- **Leads:** `~/.openclaw/workspace/research/leads-YYYY-MM-DD.json`
- **Send log:** `setready/data/send-log.json`
- **Weekly outreach list:** `~/.openclaw/workspace/research/weekly-outreach-list.json`
- **Metrics:** Track sends, opens (if available), replies, conversions

## Daily Outreach Rhythm

1. Check `weekly-outreach-list.json` for ranked leads
2. Pick top 20-30 unsent leads
3. Match to correct template (management/host/agent/owner)
4. Send via Resend API (or email campaign skill)
5. Log in send-log.json
6. Follow up on day 3 and day 7

---

*This playbook is the source of truth for all outreach. Update it as we learn what works.*
