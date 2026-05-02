import { NextRequest, NextResponse } from 'next/server';
import { getProspects, createProspect } from '@/services/prospect-service';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const prospects = await getProspects(userId);
  return NextResponse.json({ data: prospects });
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const prospect = await createProspect({ ...body, userId });
  return NextResponse.json({ data: prospect }, { status: 201 });
}