import { NextResponse } from 'next/server';
import { parseSessionCookie } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const sessionId = parseSessionCookie(request.headers.get('cookie'));

  if (!sessionId) {
    return NextResponse.json(
      { data: null, error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const session = JSON.parse(Buffer.from(sessionId, 'base64').toString());
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { data: null, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user, error: null }, { status: 200 });
  } catch {
    return NextResponse.json(
      { data: null, error: 'Invalid session' },
      { status: 401 }
    );
  }
}