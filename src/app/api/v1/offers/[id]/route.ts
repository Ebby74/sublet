import { NextRequest, NextResponse } from 'next/server';
import { getOffer, evaluateOffer, acceptOffer, rejectOffer } from '@/services/offer-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const offer = await getOffer(id);

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({ data: offer });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch offer' }, { status: 500 });
  }
}

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
    const { action } = body;

    let offer;
    if (action === 'evaluate') {
      const result = await evaluateOffer(id);
      return NextResponse.json({ data: result });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
  }
}