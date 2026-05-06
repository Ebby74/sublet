import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateUser } from '@/lib/auth';
import { createSessionCookie } from '@/lib/session';

export const dynamic = 'force-dynamic';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { data: null, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { data: user, error: null },
      { status: 200 }
    );

    response.headers.set(
      'Set-Cookie',
      createSessionCookie(user.id, user.email)
    );

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { data: null, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { data: null, error: 'Login failed' },
      { status: 500 }
    );
  }
}