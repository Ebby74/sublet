import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser } from '@/lib/auth';
import { createSessionCookie } from '@/lib/session';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = registerSchema.parse(body);

    const user = await createUser(email, password, name);

    const response = NextResponse.json(
      { data: user, error: null },
      { status: 201 }
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

    if (error instanceof Error && error.message === 'User already exists') {
      return NextResponse.json(
        { data: null, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { data: null, error: 'Failed to create account' },
      { status: 500 }
    );
  }
}