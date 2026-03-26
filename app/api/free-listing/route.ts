import { existsSync, readFileSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, isValidEmail, sanitizeEmail, sanitizeInput, writeAuditLog } from '@/lib/security';

const DATA_FILE = join(process.cwd(), 'data', 'free-listing-signups.json');
const TOTAL_SPOTS = 500;

interface FreeListingSignup {
  id: string;
  name: string;
  email: string;
  address: string;
  propertyType: string;
  photoCount: number;
  submittedAt: string;
}

function readSignups(): FreeListingSignup[] {
  if (!existsSync(DATA_FILE)) return [];
  try {
    const parsed = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    return Array.isArray(parsed) ? (parsed as FreeListingSignup[]) : [];
  } catch {
    return [];
  }
}

function writeSignups(signups: FreeListingSignup[]) {
  writeFileSync(DATA_FILE, JSON.stringify(signups, null, 2) + '\n', 'utf8');
}

export async function GET() {
  const signups = readSignups();
  const spotsRemaining = Math.max(0, TOTAL_SPOTS - signups.length);
  return NextResponse.json({ spotsRemaining, totalSpots: TOTAL_SPOTS });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const name = sanitizeInput(String(body.name || '')).slice(0, 120);
    const email = sanitizeEmail(String(body.email || ''));
    const address = sanitizeInput(String(body.address || '')).slice(0, 200);
    const propertyType = sanitizeInput(String(body.propertyType || '')).slice(0, 80);
    const photoCount = Math.max(0, Math.min(9999, parseInt(String(body.photoCount || '0'), 10) || 0));

    if (!name || !email || !address || !propertyType) {
      return NextResponse.json(
        { error: 'Name, email, property address, and property type are required.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const signups = readSignups();

    if (signups.length >= TOTAL_SPOTS) {
      return NextResponse.json({ error: 'All free spots have been claimed.' }, { status: 409 });
    }

    const duplicate = signups.find((s) => s.email === email);
    if (duplicate) {
      return NextResponse.json({ error: 'This email has already claimed a spot.' }, { status: 409 });
    }

    const signup: FreeListingSignup = {
      id: `fl_${randomUUID().slice(0, 8)}`,
      name,
      email,
      address,
      propertyType,
      photoCount,
      submittedAt: new Date().toISOString(),
    };

    signups.push(signup);
    writeSignups(signups);

    writeAuditLog('free-listing.signup', { id: signup.id, name, propertyType });

    const spotsRemaining = Math.max(0, TOTAL_SPOTS - signups.length);
    return NextResponse.json({ success: true, id: signup.id, spotsRemaining }, { status: 201 });
  } catch (error) {
    writeAuditLog('free-listing.error', { ip, error: error instanceof Error ? error.message : 'unknown_error' });
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
