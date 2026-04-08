import { NextResponse } from 'next/server';

const errorBody = {
  error: 'This endpoint has been removed. Use /api/bookings instead.',
};

export async function GET() {
  return NextResponse.json(errorBody, { status: 410 });
}

export async function POST() {
  return NextResponse.json(errorBody, { status: 410 });
}

export async function PATCH() {
  return NextResponse.json(errorBody, { status: 410 });
}
