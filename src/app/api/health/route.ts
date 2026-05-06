import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma');
    const dbStatus = await prisma.$queryRaw`SELECT 1 as status`;
    const userCount = await prisma.user.count();
    return NextResponse.json({
      db: 'connected',
      users: userCount,
      status: dbStatus
    });
  } catch (error) {
    return NextResponse.json({
      db: 'error',
      error: String(error),
      DATABASE_URL: process.env.DATABASE_URL ? 'SET (redacted)' : 'NOT SET'
    }, { status: 500 });
  }
}
