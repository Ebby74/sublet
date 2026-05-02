import { cookies } from 'next/headers';
import * as auth from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_id');

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const sessionData = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString()
    );
    const user = await prisma.user.findUnique({
      where: { id: sessionData.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        jvProperties: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export { auth };