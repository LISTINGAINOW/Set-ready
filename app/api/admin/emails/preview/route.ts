import { NextRequest, NextResponse } from "next/server";
import {
  buildWelcomeEmailHtml,
  buildNewInquiryNotificationHtml,
  buildInquiryConfirmationHtml,
  buildSubmissionReceivedHtml,
  buildSubmissionApprovedHtml,
  buildSubmissionRejectedHtml,
  buildChangesRequestedHtml,
  buildBookingConfirmationHtml,
  buildNewsletterHtml,
} from "@/lib/email";

const SAMPLE_FIRST_NAME = "Alex";
const SAMPLE_PROPERTY = "The Grand Studio — Silver Lake";

const TEMPLATES: Record<string, () => string> = {
  welcome: () => buildWelcomeEmailHtml(SAMPLE_FIRST_NAME),

  "inquiry-notification": () =>
    buildNewInquiryNotificationHtml(SAMPLE_PROPERTY, {
      name: "Jordan Lee",
      email: "jordan@example.com",
      phone: "(310) 555-0123",
      company: "Apex Productions",
      productionType: "Film",
      preferredCity: "Los Angeles",
      datesNeeded: "April 14–16, 2026",
      budget: "$2,500–$5,000",
      description:
        "Looking for a large open-plan space with natural light for a two-day feature film shoot. Need parking for 10+ vehicles and load-in access.",
      inquiryId: "inq_a1b2c3d4",
    }),

  "inquiry-confirmation": () =>
    buildInquiryConfirmationHtml(SAMPLE_FIRST_NAME, SAMPLE_PROPERTY),

  "submission-received": () =>
    buildSubmissionReceivedHtml(SAMPLE_FIRST_NAME, SAMPLE_PROPERTY),

  "submission-approved": () =>
    buildSubmissionApprovedHtml(SAMPLE_FIRST_NAME, SAMPLE_PROPERTY),

  "submission-rejected": () =>
    buildSubmissionRejectedHtml(
      SAMPLE_FIRST_NAME,
      SAMPLE_PROPERTY,
      "The provided proof of ownership document appears to be expired. Please upload a current deed, lease agreement, or notarized letter of authorization and resubmit."
    ),

  "changes-requested": () =>
    buildChangesRequestedHtml(
      SAMPLE_FIRST_NAME,
      SAMPLE_PROPERTY,
      "1. Please add at least 5 photos of the interior space.\n2. The listed square footage doesn't match the floor plan provided. Please verify and update.\n3. Emergency contact phone number appears to be invalid."
    ),

  "booking-confirmation": () =>
    buildBookingConfirmationHtml(
      SAMPLE_FIRST_NAME,
      SAMPLE_PROPERTY,
      "April 14–16, 2026 (3 days)",
      "$4,200.00"
    ),

  newsletter: () =>
    buildNewsletterHtml(
      SAMPLE_FIRST_NAME,
      "Spring 2026: Top Filming Locations in LA",
      `<p>Spring is here, and so are some incredible new spaces on SetVenue. From sun-drenched Silver Lake bungalows to sprawling Malibu estates, this season's listings are turning heads in the production world.</p>
<p style="margin-top:16px;"><strong>Featured this month:</strong></p>
<ul style="margin:12px 0;padding-left:20px;">
  <li style="margin-bottom:8px;">Mid-century modern loft in Arts District — perfect for fashion shoots</li>
  <li style="margin-bottom:8px;">Warehouse space in Culver City — 8,000 sq ft with drive-in access</li>
  <li style="margin-bottom:8px;">Cliffside estate in Malibu — panoramic ocean views</li>
</ul>
<p style="margin-top:16px;">Whether you're planning a feature film, brand campaign, or corporate retreat, SetVenue has the space for you.</p>`
    ),
};

export async function GET(request: NextRequest) {
  // LOW-1: Fail-closed — deny all access if ADMIN_PASSWORD is not configured
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ error: "Admin access not configured" }, { status: 503 });
  }

  // HIGH-2: Header-only auth — no query param (avoids password in server logs/URLs)
  const providedPassword = request.headers.get("x-admin-password");
  if (providedPassword !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const template = request.nextUrl.searchParams.get("template") ?? "";
  const builder = TEMPLATES[template];

  if (!builder) {
    const available = Object.keys(TEMPLATES).join(", ");
    return NextResponse.json(
      { error: `Unknown template. Available: ${available}` },
      { status: 400 }
    );
  }

  const html = builder();
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
