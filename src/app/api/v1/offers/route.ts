import { NextRequest, NextResponse } from 'next/server';
import { createOffer, getOffers, evaluateOffer } from '@/services/offer-service';
import { ringgitToSen } from '@/lib/format';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get('status') || undefined,
      roomId: searchParams.get('roomId') || undefined,
    };

    const offers = await getOffers(userId, filters);
    return NextResponse.json({ data: offers, meta: { total: offers.length } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { roomId, prospectId, amount, moveInDate } = body;

    if (!roomId || !prospectId || !amount || !moveInDate) {
      return NextResponse.json({ error: 'roomId, prospectId, amount, and moveInDate required' }, { status: 400 });
    }

    const offer = await createOffer({
      roomId,
      prospectId,
      amountSen: ringgitToSen(amount),
      moveInDate: new Date(moveInDate),
    });

    return NextResponse.json({ data: offer }, { status: 201 });
  } catch (error) {
    console.error('POST offers error:', error);
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
  }
}