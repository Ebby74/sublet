import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentReminders, checkLeaseExpiry } from '@/services/notification-service';

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const paymentResult = await checkPaymentReminders();
    const leaseResult = await checkLeaseExpiry();

    return NextResponse.json({
      success: true,
      message: 'Notification check completed',
      results: {
        payments: paymentResult,
        leases: leaseResult,
      },
    });
  } catch (error) {
    console.error('Notification check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check notifications' },
      { status: 500 }
    );
  }
}