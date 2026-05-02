import { NextRequest, NextResponse } from 'next/server';
import { createPayment, getPayments } from '@/services/payment-service';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.session) return auth.response;

  const userId = auth.session.user.id;
  const { searchParams } = new URL(request.url);

  const statusParam = searchParams.get('status');
  let statusFilter: 'pending' | 'paid' | 'overdue' | 'cancelled' | undefined;
  let statusInFilter: Array<'pending' | 'paid' | 'overdue' | 'cancelled'> | undefined;

  if (statusParam) {
    if (statusParam.includes(',')) {
      statusInFilter = statusParam.split(',') as Array<'pending' | 'paid' | 'overdue' | 'cancelled'>;
    } else {
      statusFilter = statusParam as 'pending' | 'paid' | 'overdue' | 'cancelled';
    }
  }

  const limit = searchParams.get('limit');
  const limitNum = limit ? parseInt(limit) : undefined;

  const filters = {
    type: searchParams.get('type') as 'income' | 'expense' | undefined,
    status: statusFilter,
    statusIn: statusInFilter,
    tenantId: searchParams.get('tenantId') || undefined,
    leaseId: searchParams.get('leaseId') || undefined,
    incomeSource: searchParams.get('incomeSource') || undefined,
    startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
    endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
    limit: limitNum,
  };

  const payments = await getPayments(userId, filters);
  return NextResponse.json({ data: payments });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.session) return auth.response;

  const userId = auth.session.user.id;
  const body = await request.json();
  const payment = await createPayment({ ...body, userId });
  return NextResponse.json({ data: payment }, { status: 201 });
}
