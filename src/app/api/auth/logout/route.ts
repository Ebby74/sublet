import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/session';

export async function POST() {
  const response = NextResponse.json(
    { data: { message: 'Logged out successfully' }, error: null },
    { status: 200 }
  );

  response.headers.set('Set-Cookie', clearSessionCookie());

  return response;
}