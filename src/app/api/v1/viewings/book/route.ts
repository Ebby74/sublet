import { NextRequest, NextResponse } from 'next/server';
import { createViewing } from '@/services/viewing-service';
import { prisma } from '@/lib/prisma';
import { createProspect } from '@/services/prospect-service';
import { whatsappService } from '@/services/whatsapp-service';
import { format } from 'date-fns';

const phoneRegex = /^(\+60|60|0)?[1-9]\d{8,9}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId, prospectName, prospectPhone, scheduledAt } = body;

    if (!roomId || !prospectName || !prospectPhone || !scheduledAt) {
      return NextResponse.json(
        { error: 'roomId, prospectName, prospectPhone, and scheduledAt required' },
        { status: 400 }
      );
    }

    const phoneClean = prospectPhone.replace(/\s/g, '');
    if (!phoneRegex.test(phoneClean)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    let prospect = await prisma.prospect.findFirst({
      where: { phone: phoneClean, deletedAt: null },
    });

    if (!prospect) {
      prospect = await createProspect({
        name: prospectName,
        phone: phoneClean,
        source: 'website',
        roomId,
        userId: 'system',
      });
    }

    const viewing = await createViewing(
      { roomId, prospectId: prospect.id, scheduledAt: new Date(scheduledAt) },
      process.env.SYSTEM_USER_ID || 'system'
    );

    const viewingDate = format(new Date(scheduledAt), 'dd MMM yyyy');
    const viewingTime = format(new Date(scheduledAt), 'h:mm a');

    await whatsappService.notifyViewingConfirmation(
      prospectPhone,
      prospectName,
      viewingDate,
      viewingTime
    );

    return NextResponse.json(
      { data: viewing, message: 'Viewing booked successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Book viewing error:', error);
    return NextResponse.json({ error: 'Failed to book viewing' }, { status: 500 });
  }
}
