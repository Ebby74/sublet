import { NextRequest, NextResponse } from 'next/server';
import { generateOfferLetterHTML } from '@/services/offer-letter-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const html = await generateOfferLetterHTML(id);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="offer-letter-${id}.html"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate letter' }, { status: 500 });
  }
}