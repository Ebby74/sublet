import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

const SALT_ROUNDS = 12;
const SESSION_COOKIE_NAME = 'session_id';
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(
  email: string,
  password: string,
  name?: string
) {
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new Error('User already exists');
  }

  const hashedPassword = await hashPassword(password);

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });
}

export async function authenticateUser(
  email: string,
  password: string
) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

export function getSessionCookieOptions(expires = true) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    ...(expires ? { maxAge: SESSION_EXPIRY_MS } : {}),
  };
}

export async function getCurrentUser(request: Request) {
  const sessionId = request.headers
    .get('cookie')
    ?.split('; ')
    .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`))
    ?.split('=')[1];

  if (!sessionId) {
    return null;
  }

  try {
    const sessionData = JSON.parse(
      Buffer.from(sessionId, 'base64').toString()
    );
    return sessionData;
  } catch {
    return null;
  }
}

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();

  if (!session?.user?.id) {
    return {
      response: NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      ),
      session: null,
    };
  }

  return { response: null, session };
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}
