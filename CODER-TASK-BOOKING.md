## Build Booking/Inquiry Request Flow

This is a Next.js 14 app with Supabase backend. Build a system where production companies can submit booking inquiries for properties, and owners get notified.

## WHAT TO BUILD

### 1. Inquiry Form on Property Pages
Each property page (app/properties/[slug]/page.tsx) should have an inquiry/booking request section.

**Form fields:**
- Full name (text, required)
- Email (email, required)
- Phone (tel, required)
- Company/production name (text, optional)
- Production type: dropdown — Film, TV, Commercial, Music Video, Photo Shoot, Event, Other (required)
- Preferred dates (date range picker or two date inputs: start/end, required)
- Duration: dropdown — Half Day, Full Day, Multi-Day, Weekly, Monthly (required)
- Estimated crew size (number, optional)
- Budget range: dropdown — Under $1K, $1K-$5K, $5K-$10K, $10K-$25K, $25K-$50K, $50K+ (optional)
- Special requirements/message (textarea, optional)
- How did you hear about us: dropdown — Google, Instagram, Referral, Industry Directory, Other (optional)

**Design:**
- Place as a card/section on the property detail page (below property details, above footer)
- Title: "Request to Book" or "Inquire About This Property"
- Clean form matching Apple aesthetic
- Submit button: "Send Inquiry"
- Success message after submit: "Inquiry sent! The property owner will respond within 24-48 hours."

### 2. Booking Inquiries API Route (app/api/inquiries/route.ts)
POST endpoint that:
- Validates required fields
- Saves to the existing `inquiries` table in Supabase (already has columns: id, property_id, name, email, phone, production_type, preferred_city, dates_needed, duration, crew_size, budget_range, must_have_features, description, source, status, created_at)
- Sends notification email via Resend to noreply@setvenue.com with inquiry details
- Returns success

### 3. Inquiries List in Admin Dashboard
Add an "Inquiries" tab/section to the admin dashboard (app/admin/page.tsx):
- Show all inquiries from the `inquiries` table
- Each inquiry card shows: name, email, property, production type, dates, status
- Status badges: new (blue), contacted (yellow), booked (green), declined (red)
- Click to view full details

### 4. Inquiry Detail View
Either inline expand or a detail page showing:
- All inquiry fields
- Property it's for (with link)
- Action buttons: Mark as Contacted, Mark as Booked, Decline
- Notes field for internal notes

### 5. Update Inquiries Table
Create migration: supabase/migrations/update_inquiries_table.sql
- Add columns if not exist: company_name TEXT, hear_about_us TEXT, admin_notes TEXT, contacted_at TIMESTAMPTZ, booked_at TIMESTAMPTZ

## DESIGN RULES
- Match existing Apple-like aesthetic
- Inquiry form should feel premium, not like a generic contact form
- Mobile responsive — production people often browse on phones
- No border-black, use border-slate-200
- Blue-600 accents for CTAs

## TECHNICAL RULES
- Use createAdminClient from utils/supabase/admin for server operations
- Check what columns the inquiries table actually has before creating the API route (read the existing schema)
- Run npm run build to verify no errors
- Do NOT commit or push
- Do NOT delete any files
- Do NOT modify the header, footer, or unrelated pages
