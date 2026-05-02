import { NextRequest, NextResponse } from 'next/server';
import { getViewing, completeViewing, cancelViewing } from '@/services/viewing-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const viewing = await getViewing(id);

    if (!viewing) {
      return NextResponse.json({ error: 'Viewing not found' }, { status: 404 });
    }

    return NextResponse.json({ data: viewing });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch viewing' }, { status: 500 });
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
    const { status, result, notes } = body;

    let viewing;
    if (status === 'completed' && result) {
      viewing = await completeViewing(id, result, notes);
    } else if (status === 'cancelled') {
      viewing = await cancelViewing(id);
    } else {
      return NextResponse.json({ error: 'Invalid update' }, { status: 400 });
    }

    return NextResponse.json({ data: viewing });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update viewing' }, { status: 500 });
  }
}