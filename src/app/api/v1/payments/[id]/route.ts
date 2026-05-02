import { NextRequest, NextResponse } from 'next/server';
import { getPayment, updatePayment, deletePayment } from '@/services/payment-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payment = await getPayment(id);
  
  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }
  
  return NextResponse.json({ data: payment });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  
  const payment = await updatePayment(id, body);
  return NextResponse.json({ data: payment });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deletePayment(id);
  return NextResponse.json({ success: true });
}