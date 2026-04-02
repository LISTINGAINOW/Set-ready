# Host Dashboard PR — Branch: clawby/host-dashboard

> **Note:** This branch was built locally by Clawby. The j3ffffff account lacks push access to LISTINGAINOW/Set-ready — Josh needs to push this branch or grant access.
> Push command: `git push origin clawby/host-dashboard`

---

## What was built

A complete `/host` portal where property owners can manage ONLY their own listings via email + OTP (no password required).

### New Files (15)
- `supabase/migrations/add_owner_fields_and_host_sessions.sql`
- `lib/host-auth.ts`
- `app/api/host/send-otp/route.ts`
- `app/api/host/verify-otp/route.ts`
- `app/api/host/logout/route.ts`
- `app/api/host/properties/route.ts`
- `app/api/host/properties/[id]/route.ts`
- `app/api/host/properties/[id]/photos/route.ts`
- `app/api/host/inquiries/route.ts`
- `app/host/layout.tsx`
- `app/host/login/page.tsx`
- `app/host/page.tsx`
- `app/host/properties/page.tsx`
- `app/host/properties/[id]/page.tsx`
- `app/host/inquiries/page.tsx`

---

## Pages

| Route | Description |
|-------|-------------|
| `/host/login` | Two-step: enter email → receive 6-digit code → sign in |
| `/host` | Dashboard with stats (properties, inquiries) + quick links |
| `/host/properties` | List of owner's properties with status badges |
| `/host/properties/[id]` | Full editor: name, description, price, amenities, uses, photos, visibility |
| `/host/inquiries` | Expandable inquiry cards with production details + contact info |

---

## Auth System

- Email + OTP (no passwords to forget)
- 6-digit numeric code, 15-minute expiry, single-use
- Session stored in `host_sessions` table, 7-day TTL, httpOnly cookie
- Timing-safe comparison for OTP codes

---

## Security

- **Every DB query filters by `owner_email`** — owners cannot see other owners' data
- Photo delete validates `storagePath.startsWith(propertyId/)` — can't delete other properties' photos
- Property status can only be set to `active` or `hidden` — admin-only values blocked
- All API routes server-side only via service role; RLS denies direct client access
- No delete capability anywhere in host portal (admin only)

---

## Database Migration

Run `supabase/migrations/add_owner_fields_and_host_sessions.sql` in Supabase SQL Editor:

```sql
-- Safe (uses IF NOT EXISTS):
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_phone TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_name TEXT;

-- New tables:
CREATE TABLE host_sessions (...);  -- session tokens
CREATE TABLE host_otps (...);      -- one-time codes
```

Note: `owner_email`, `owner_phone`, `owner_name` already exist in the current schema — this migration is fully safe to run.

---

## TODO before going live

1. **Wire up email sending** in `app/api/host/send-otp/route.ts` — currently logs to console in dev. Replace the TODO comment with your Resend/SendGrid call.
2. **Run the migration** in Supabase SQL Editor.
3. **Set `owner_email`** on existing properties so owners can log in and see their listings.
