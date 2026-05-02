import { NextRequest, NextResponse } from 'next/server';
import { createProspect } from '@/services/prospect-service';
import { prisma } from '@/lib/prisma';
import { whatsappService } from '@/services/whatsapp-service';
import { WHATSAPP_ADMIN_PHONE } from '@/lib/whatsapp';

interface InquiryInput {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  roomId?: string;
  source?: string;
  utmData?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const body: InquiryInput = await request.json();

    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    const phoneRegex = /^(\+60|60|0)?[1-9]\d{8,9}$/;
    if (!phoneRegex.test(body.phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    let userId: string | undefined;
    if (body.roomId) {
      const room = await prisma.room.findUnique({
        where: { id: body.roomId },
        include: { floor: { include: { property: true } } },
      });
      if (room) {
        userId = room.floor.property.userId;
      }
    }

    if (!userId) {
      const user = await prisma.user.findFirst({
        where: { role: 'admin' },
      });
      userId = user?.id;
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'No owner found for this listing' },
        { status: 400 }
      );
    }

    const existing = await prisma.prospect.findFirst({
      where: { phone: body.phone, deletedAt: null },
    });

    let prospect;
    if (existing) {
      prospect = await prisma.prospect.update({
        where: { id: existing.id },
        data: {
          status: 'new',
          roomId: body.roomId || existing.roomId,
          notes: JSON.stringify([
            ...(existing.notes ? JSON.parse(existing.notes) : []),
            {
              type: 'inquiry',
              content: body.message || 'New inquiry received',
              createdAt: new Date().toISOString(),
              source: body.source,
            },
          ]),
        },
      });
    } else {
      prospect = await createProspect({
        name: body.name,
        phone: body.phone,
        email: body.email,
        source: body.source || 'website',
        utmData: body.utmData ? JSON.stringify(body.utmData) : undefined,
        roomId: body.roomId,
        userId,
      });

      if (body.message) {
        await prisma.prospect.update({
          where: { id: prospect.id },
          data: {
            notes: JSON.stringify([
              {
                type: 'inquiry',
                content: body.message,
                createdAt: new Date().toISOString(),
              },
            ]),
          },
        });
      }
    }

    const adminPhone = WHATSAPP_ADMIN_PHONE;
    if (adminPhone) {
      await whatsappService.notifyAdminInquiry(
        adminPhone,
        body.name,
        body.phone,
        body.message || 'New inquiry received'
      );
    }

    return NextResponse.json(
      {
        data: prospect,
        message: 'Inquiry received! We will contact you soon.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Inquiry error:', error);
    return NextResponse.json(
      { error: 'Failed to process inquiry' },
      { status: 500 }
    );
  }
}
