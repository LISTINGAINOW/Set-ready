# SetVenue Booking Flow Guide

**Purpose:** Document the end-to-end booking process so every agent and Josh knows exactly what happens.

---

## For Production Companies (Renters)

### Step 1: Browse
- Visit setvenue.com
- Filter by city, property type, price, features
- View property details, photos, compliance info

### Step 2: Inquiry
- Click "Book Now" or "Request to Book" on a property
- Fill in: dates, crew size, production type, budget
- Inquiry goes to property owner via email

### Step 3: Owner Approval
- Owner receives email with booking request details
- Owner approves or declines
- If approved, renter gets confirmation email

### Step 4: Payment
- Renter pays through Stripe
- Breakdown: Owner's listed price + 10% SetVenue service fee
- Owner receives 100% of their listed price
- SetVenue keeps the 10% service fee

### Step 5: Booking Confirmed
- Both parties get confirmation with:
  - Property address and access instructions
  - Date/time of booking
  - Cancellation policy
  - Insurance requirements
  - Emergency contact

### Step 6: The Shoot
- Crew arrives at agreed time
- Follows property rules
- Owner or representative present if required

### Step 7: Post-Booking
- Both parties can leave reviews
- Payment settles to owner (Stripe payout schedule)
- Any disputes → setvenue.com/legal/disputes

## For Property Owners (Hosts)

### Step 1: List
- Go to setvenue.com/free-listing
- Create account (email + password)
- Add property: address, description, photos, pricing, availability
- Set rules: max crew size, hours, restrictions
- Add compliance info: TOT license, insurance, business license

### Step 2: Get Found
- Property appears in search results
- Featured on city hub pages
- SEO-optimized for Google (meta tags, JSON-LD)

### Step 3: Receive Inquiries
- Email notification when someone wants to book
- Review details: who, when, what type of production
- Approve or decline

### Step 4: Get Paid
- Payment processed through Stripe
- You receive 100% of your listed price
- Payout on Stripe's standard schedule (2-7 business days)
- No deductions, no commission, no hidden fees

### Step 5: After the Booking
- Leave a review of the renter
- Report any issues within 48 hours
- Damage claims go through dispute resolution

## Cancellation Policies

Owners choose one when listing:

| Policy | Renter Cancels | Refund |
|--------|---------------|--------|
| **Flexible** | 24+ hours before | Full refund |
| **Moderate** | 5+ days before | Full refund |
| **Strict** | 14+ days before | 50% refund |
| **Production Custom** | Per-contract terms | Negotiated |

Full details: setvenue.com/legal/cancellation

## What's NOT Live Yet

Be honest about what's still being built:
- [ ] Automated booking calendar (currently manual approval via email)
- [ ] In-app messaging (currently email-based)
- [ ] Review system (coming soon)
- [ ] Stripe Connect for instant payouts (currently standard Stripe)
- [ ] Mobile app

**If someone asks about these:** "We're building that right now. For now, [how it currently works]. It'll be seamless once it's live."

Don't pretend features exist that don't.

---

*Update this as features launch. Remove items from "NOT Live Yet" as they go live.*
