import { NextRequest, NextResponse } from 'next/server';
import { marketingTriggerService } from '@/services/marketing-trigger-service';
import { z } from 'zod';

const triggerSchema = z.object({
  propertyId: z.string().uuid(),
});

/**
 * POST /api/v1/marketing/trigger
 * Manually trigger marketing for a property
 */
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { propertyId } = triggerSchema.parse(body);

  const result = await marketingTriggerService.manualTrigger(userId, propertyId);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Failed to trigger marketing', details: result },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    triggeredAt: result.triggeredAt,
    channels: result.channels,
  });
}

/**
 * GET /api/v1/marketing/trigger
 * Get marketing status for a property
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('property_id');

  if (!propertyId) {
    return NextResponse.json(
      { error: 'property_id parameter required' },
      { status: 400 }
    );
  }

  // For MVP, return current status (no marketing history tracked yet)
  // Future: Query MarketingPost model for history
  return NextResponse.json({
    propertyId,
    lastTriggered: null,
    status: 'available', // available, posted, promoting
  });
}
