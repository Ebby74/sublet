import { NextRequest, NextResponse } from 'next/server';
import { saveTenantIcDocument } from '@/services/tenant-service';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const tenantId = formData.get('tenantId') as string;
  const documentType = formData.get('documentType') as 'ic-front' | 'ic-back';

  if (!file || !tenantId || !documentType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await saveTenantIcDocument(tenantId, documentType, {
    name: file.name,
    buffer,
  });

  return NextResponse.json({ url }, { status: 201 });
}
