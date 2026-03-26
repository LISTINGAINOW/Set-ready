import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'free-listing-signups.json');

async function readSignups(): Promise<unknown[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeSignups(signups: unknown[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(signups, null, 2), 'utf-8');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, address, propertyType, photoCount } = body;

    if (!name || !email || !address || !propertyType || !photoCount) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const signups = await readSignups();

    const duplicate = signups.some((s: any) => s.email?.toLowerCase() === email.toLowerCase());
    if (duplicate) {
      return NextResponse.json({ error: 'This email is already registered.' }, { status: 409 });
    }

    const entry = {
      id: crypto.randomUUID(),
      name,
      email,
      address,
      propertyType,
      photoCount: Number(photoCount),
      submittedAt: new Date().toISOString(),
    };

    signups.push(entry);
    await writeSignups(signups);

    return NextResponse.json({ success: true, id: entry.id }, { status: 201 });
  } catch (err) {
    console.error('free-listing signup error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
