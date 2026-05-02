import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const SessionRequestSchema = z.object({
  sessionId: z.string().uuid().nullable().optional(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
      timestamp: z.string().or(z.date()).optional(),
    })
  ).min(1).max(100),
  prospectData: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    requirements: z.string().optional(),
  }).optional(),
  roomId: z.string().uuid().optional(),
  step: z.number().int().min(0).max(4).default(0),
  status: z.enum(['active', 'completed', 'abandoned']).default('active'),
});

const DEFAULT_USER_ID = process.env.DEFAULT_ADMIN_USER_ID || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SessionRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data', details: parsed.error.flatten() }, { status: 400 });
    }

    const { sessionId, messages, prospectData, roomId, step, status } = parsed.data;

    const metadata = JSON.stringify({ step, requirements: prospectData?.requirements });
    const messagesJson = JSON.stringify(messages);

    if (sessionId) {
      const existing = await prisma.chatSession.findUnique({
        where: { id: sessionId },
      });

      if (existing) {
        const updated = await prisma.chatSession.update({
          where: { id: sessionId },
          data: {
            messages: messagesJson,
            status,
            metadata,
            ...(roomId && { roomId }),
          },
        });

        if (prospectData?.name && existing.prospectId) {
          await prisma.prospect.update({
            where: { id: existing.prospectId },
            data: {
              ...(prospectData.name && { name: prospectData.name }),
              ...(prospectData.phone && { phone: prospectData.phone }),
              ...(prospectData.email && { email: prospectData.email }),
              ...(prospectData.requirements && { notes: prospectData.requirements }),
              ...(roomId && { roomId }),
              status: status === 'completed' ? 'interested' : 'new',
            },
          });
        }

        return NextResponse.json({ sessionId: updated.id, prospectId: existing.prospectId });
      }
    }

    if (!prospectData?.name) {
      const newSession = await prisma.chatSession.create({
        data: {
          messages: messagesJson,
          status,
          metadata,
          ...(roomId && { roomId }),
        },
      });

      return NextResponse.json({ sessionId: newSession.id, prospectId: null }, { status: 201 });
    }

    if (!DEFAULT_USER_ID) {
      const newSession = await prisma.chatSession.create({
        data: {
          messages: messagesJson,
          status,
          metadata,
          ...(roomId && { roomId }),
        },
      });

      return NextResponse.json({ sessionId: newSession.id, prospectId: null }, { status: 201 });
    }

    const prospect = await prisma.prospect.create({
      data: {
        name: prospectData.name,
        phone: prospectData.phone || null,
        email: prospectData.email || null,
        source: 'website_chat',
        notes: prospectData.requirements || null,
        roomId: roomId || null,
        userId: DEFAULT_USER_ID,
        status: status === 'completed' ? 'interested' : 'new',
      },
    });

    const newSession = await prisma.chatSession.create({
      data: {
        prospectId: prospect.id,
        messages: messagesJson,
        status,
        metadata,
        ...(roomId && { roomId }),
      },
    });

    return NextResponse.json({ sessionId: newSession.id, prospectId: prospect.id }, { status: 201 });
  } catch (error) {
    console.error('Session save error:', error);
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        prospect: true,
        room: {
          include: {
            floor: {
              include: {
                property: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...session,
      messages: JSON.parse(session.messages),
      metadata: session.metadata ? JSON.parse(session.metadata) : null,
    });
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}
