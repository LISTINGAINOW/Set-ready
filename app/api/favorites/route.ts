import { NextRequest, NextResponse } from 'next/server';
import favoritesData from '@/data/favorites.json';

type Favorite = {
  id: string;
  propertyId: string;
  createdAt: string;
};

type FavoritesData = {
  favorites: Favorite[];
};

// In-memory store (does not persist across serverless invocations)
let inMemoryFavorites: Favorite[] = (favoritesData.favorites || []).map((favorite) => ({
  id: favorite.id,
  propertyId: favorite.locationId,
  createdAt: favorite.createdAt,
}));

function serializeFavorite(favorite: Favorite) {
  return {
    ...favorite,
    locationId: favorite.propertyId,
  };
}

export async function GET(request: NextRequest) {
  try {
    const favorites = inMemoryFavorites.map(serializeFavorite);
    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Error reading favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const propertyId = body?.propertyId || body?.locationId;

    if (!propertyId) {
      return NextResponse.json({ error: 'Missing propertyId' }, { status: 400 });
    }

    const existing = inMemoryFavorites.find((fav) => fav.propertyId === propertyId);
    if (existing) {
      return NextResponse.json({ error: 'Already in favorites' }, { status: 409 });
    }

    const newFavorite: Favorite = {
      id: `fav_${Date.now()}`,
      propertyId,
      createdAt: new Date().toISOString(),
    };

    inMemoryFavorites.push(newFavorite);
    return NextResponse.json({ favorite: serializeFavorite(newFavorite) }, { status: 201 });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId') || searchParams.get('locationId');

    if (!propertyId) {
      return NextResponse.json({ error: 'Missing propertyId' }, { status: 400 });
    }

    const initialLength = inMemoryFavorites.length;
    inMemoryFavorites = inMemoryFavorites.filter((fav) => fav.propertyId !== propertyId);

    if (inMemoryFavorites.length === initialLength) {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}