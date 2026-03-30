import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { requireAdminSession } from '@/lib/auth-middleware';

const SUBMISSIONS_PATH = join(process.cwd(), 'data', 'submissions.json');
const LOCATIONS_PATH = join(process.cwd(), 'data', 'locations.json');

type SubmissionStatus = 'pending_review' | 'approved' | 'rejected' | 'changes_requested';

interface Submission {
  id: string;
  title: string;
  property_type: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  description: string;
  beds: number;
  baths: number;
  sqft: number;
  hourly_rate: number;
  daily_rate: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  photo_urls: string[];
  status: SubmissionStatus;
  submitted_at: string;
  reviewer_notes?: string;
  reviewed_at?: string;
}

function loadJSON<T>(filePath: string): T[] {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8')) as T[];
  } catch {
    return [];
  }
}

function saveJSON(filePath: string, data: unknown[]): void {
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function generateSlug(title: string, city: string, id: string): string {
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  return `${slugify(title)}-${slugify(city)}-${id.slice(-6)}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = requireAdminSession(request);
  if (authResult !== true) return authResult;

  const { id } = await params;
  const submissions = loadJSON<Submission>(SUBMISSIONS_PATH);
  const submission = submissions.find((s) => s.id === id);

  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }

  return NextResponse.json({ submission });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = requireAdminSession(request);
  if (authResult !== true) return authResult;

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Accept either `action` (new spec) or `status` (legacy) field
  const action = (body.action ?? body.status) as string | undefined;
  const notes = (body.notes ?? body.reviewer_notes) as string | undefined;

  const validActions: SubmissionStatus[] = ['approved', 'rejected', 'changes_requested'];
  if (!action || !validActions.includes(action as SubmissionStatus)) {
    return NextResponse.json(
      { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
      { status: 400 },
    );
  }

  const submissions = loadJSON<Submission>(SUBMISSIONS_PATH);
  const idx = submissions.findIndex((s) => s.id === id);

  if (idx === -1) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }

  const updated: Submission = {
    ...submissions[idx],
    status: action as SubmissionStatus,
    reviewer_notes: notes ?? undefined,
    reviewed_at: new Date().toISOString(),
  };
  submissions[idx] = updated;
  saveJSON(SUBMISSIONS_PATH, submissions);

  // If approved, add the property to locations.json
  if (action === 'approved') {
    try {
      const locations = loadJSON<Record<string, unknown>>(LOCATIONS_PATH);
      const slug = generateSlug(updated.title, updated.city, updated.id);

      // Only add if not already present
      const alreadyExists = locations.some(
        (loc) => loc.slug === slug || loc.id === slug,
      );

      if (!alreadyExists) {
        const newLocation: Record<string, unknown> = {
          id: slug,
          name: updated.title,
          slug,
          address: updated.address,
          city: updated.city,
          state: updated.state,
          zip: updated.zip,
          beds: updated.beds,
          baths: updated.baths,
          sqft: updated.sqft,
          propertyType: updated.property_type,
          pricePerHour: updated.hourly_rate,
          pricePerDay: updated.daily_rate,
          description: updated.description,
          amenities: [],
          bestUses: [],
          images: updated.photo_urls,
        };
        locations.push(newLocation);
        saveJSON(LOCATIONS_PATH, locations);
      }
    } catch (err) {
      console.error('Failed to add property to locations.json:', err);
      // Don't fail the whole request — submission status was already saved
    }
  }

  return NextResponse.json({ submission: updated });
}
