import { NextRequest, NextResponse } from 'next/server';
import { acceptOffer } from '@/services/offer-service';
import { createTenantFromOffer } from '@/services/offer-letter-service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { createTenant } = body;

    const offer = await acceptOffer(id, 'admin');

    let tenant: Awaited<ReturnType<typeof createTenantFromOffer>> | null = null;
    if (createTenant) {
      tenant = await createTenantFromOffer(id, userId);
    }

    return NextResponse.json({ data: { offer, tenant } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to accept offer' }, { status: 500 });
  }
}