import { NextRequest, NextResponse } from 'next/server';
import { marketingChannelService, type MarketingChannel } from '@/services/marketing-channel-service';
import { z } from 'zod';

const updateChannelSchema = z.object({
  channel: z.enum(['instagram', 'facebook', 'whatsapp', 'website']),
  enabled: z.boolean(),
  config: z.record(z.unknown()).optional(),
});

/**
 * GET /api/v1/marketing/channels
 * Get all marketing channel settings for the authenticated user
 */
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const channels = await marketingChannelService.getChannels(userId);
  return NextResponse.json({ data: channels });
}

/**
 * PUT /api/v1/marketing/channels
 * Update marketing channel settings
 */
export async function PUT(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateChannelSchema.parse(body);

  await marketingChannelService.updateChannel(
    userId,
    parsed.channel as MarketingChannel,
    parsed.enabled,
    parsed.config as any
  );

  return NextResponse.json({ success: true });
}
