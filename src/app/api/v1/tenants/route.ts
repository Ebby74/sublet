import { NextRequest, NextResponse } from 'next/server';
import { getTenants, createTenant } from '@/services/tenant-service';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenants = await getTenants(userId);
  return NextResponse.json({ data: tenants });
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const tenant = await createTenant({ ...body, userId });
  return NextResponse.json({ data: tenant }, { status: 201 });
}
