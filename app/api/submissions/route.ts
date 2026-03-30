import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const SUBMISSIONS_PATH = join(process.cwd(), 'data', 'submissions.json');

function loadSubmissions(): object[] {
  try {
    return JSON.parse(readFileSync(SUBMISSIONS_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function saveSubmissions(submissions: object[]): void {
  writeFileSync(SUBMISSIONS_PATH, JSON.stringify(submissions, null, 2), 'utf-8');
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate required fields
  const required = ['title', 'property_type', 'city', 'state', 'contact_name', 'contact_email'];
  const missing = required.filter((f) => !body[f] || String(body[f]).trim() === '');
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(', ')}` },
      { status: 400 },
    );
  }

  const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const submission = {
    id,
    title: String(body.title).trim(),
    property_type: String(body.property_type).trim(),
    address: body.address ? String(body.address).trim() : '',
    city: String(body.city).trim(),
    state: String(body.state).trim(),
    zip: body.zip ? String(body.zip).trim() : '',
    description: body.description ? String(body.description).trim() : '',
    beds: body.beds ? Number(body.beds) : 0,
    baths: body.baths ? Number(body.baths) : 0,
    sqft: body.sqft ? Number(body.sqft) : 0,
    hourly_rate: body.hourly_rate ? Number(body.hourly_rate) : 0,
    daily_rate: body.daily_rate ? Number(body.daily_rate) : 0,
    contact_name: String(body.contact_name).trim(),
    contact_email: String(body.contact_email).trim(),
    contact_phone: body.contact_phone ? String(body.contact_phone).trim() : '',
    photo_urls: Array.isArray(body.photo_urls) ? body.photo_urls : [],
    status: 'pending_review',
    submitted_at: new Date().toISOString(),
  };

  try {
    const submissions = loadSubmissions();
    submissions.unshift(submission);
    saveSubmissions(submissions);
  } catch (err) {
    console.error('Failed to save submission:', err);
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
  }

  return NextResponse.json({ id, message: 'Submission received' }, { status: 201 });
}
