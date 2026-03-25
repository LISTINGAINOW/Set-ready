import { NextRequest, NextResponse } from 'next/server';
import favoritesData from '@/data/favorites.json';

type Favorite = {
  id: string;
  producerId: string;
  locationId: string;
  createdAt: string;
};

type FavoritesData = {
  favorites: Favorite[];
};

// In-memory store (does not persist across serverless invocations)
let inMemoryFavorites: Favorite[] = favoritesData.favorites || [];

function getFavorites(producerId: string): Favorite[] {
  return inMemoryFavorites.filter(fav => fav.producerId === producerId);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const producerId = searchParams.get('producerId') || 'producer_001'; // default for demo

    const favorites = getFavorites(producerId);
    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Error reading favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { producerId, locationId } = body;

    if (!producerId || !locationId) {
      return NextResponse.json({ error: 'Missing producerId or locationId' }, { status: 400 });
    }

    const existing = inMemoryFavorites.find(
      fav => fav.producerId === producerId && fav.locationId === locationId
    );
    if (existing) {
      return NextResponse.json({ error: 'Already in favorites' }, { status: 409 });
    }

    const newFavorite: Favorite = {
      id: `fav_${Date.now()}`,
      producerId,
      locationId,
      createdAt: new Date().toISOString(),
    };

    inMemoryFavorites.push(newFavorite);
    return NextResponse.json({ favorite: newFavorite }, { status: 201 });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const producerId = searchParams.get('producerId') || 'producer_001';
    const locationId = searchParams.get('locationId');

    if (!locationId) {
      return NextResponse.json({ error: 'Missing locationId' }, { status: 400 });
    }

    const initialLength = inMemoryFavorites.length;
    inMemoryFavorites = inMemoryFavorites.filter(
      fav => !(fav.producerId === producerId && fav.locationId === locationId)
    );

    if (inMemoryFavorites.length === initialLength) {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}