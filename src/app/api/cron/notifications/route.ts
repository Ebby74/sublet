import { NextRequest, NextResponse } from 'next/server';
import { runAllNotificationChecks } from '@/lib/scheduler';
import { logger } from '@/lib/logger';

const log = logger.child({ route: 'cron/notifications' });

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    log.warn('Unauthorized cron attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runAllNotificationChecks();
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log.error({ error }, 'Cron notification check failed');
    return NextResponse.json(
      { error: 'Cron job failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST with Bearer token to trigger' },
    { status: 405 }
  );
}
