import { NextRequest, NextResponse } from 'next/server';
import { rejectOffer } from '@/services/offer-service';

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
    const offer = await rejectOffer(id, 'admin');

    return NextResponse.json({ data: offer });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reject offer' }, { status: 500 });
  }
}