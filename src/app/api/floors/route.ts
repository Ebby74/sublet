import { NextRequest, NextResponse } from 'next/server';
import { createFloor, getFloorsByProperty } from '@/services/floor-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId');

  if (!propertyId) {
    return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
  }

  const floors = await getFloorsByProperty(propertyId);
  return NextResponse.json({ data: floors });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, name, level } = body;

    if (!propertyId || !name) {
      return NextResponse.json({ error: 'propertyId and name are required' }, { status: 400 });
    }

    const floor = await createFloor({ propertyId, name, level });
    return NextResponse.json({ data: floor }, { status: 201 });
  } catch (error) {
    console.error('Create floor error:', error);
    return NextResponse.json({ error: 'Failed to create floor' }, { status: 500 });
  }
}