import { NextRequest, NextResponse } from 'next/server';
import { getProperties, createProperty } from '@/services/property-service';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const properties = await getProperties(userId);
  return NextResponse.json({ data: properties });
}

export async function POST(request: NextRequest) {
  let userId = request.headers.get('x-user-id');
  const body = await request.json();
  
  if (!userId) {
    userId = body.userId;
  }
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId: _, ...rest } = body;
  const property = await createProperty({ ...rest, userId });
  return NextResponse.json({ data: property }, { status: 201 });
}