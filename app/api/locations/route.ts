import { NextRequest, NextResponse } from 'next/server';
import locationsData from '@/data/locations.json';

export async function GET() {
  try {
    return NextResponse.json(locationsData);
  } catch (error) {
    console.error('Error reading locations:', error);
    return NextResponse.json({ error: 'Failed to load locations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const locations = locationsData as any[];
    
    const newLocation = {
      id: Date.now().toString(),
      ...body,
    };
    // In production, you would write to a database.
    // For now, we return the new location without persisting.
    console.log('POST /api/locations - new location:', newLocation);
    return NextResponse.json(newLocation, { status: 201 });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
}