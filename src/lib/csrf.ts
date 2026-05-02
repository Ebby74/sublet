import { cookies } from 'next/headers';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

export function generateCsrfToken(): string {
  const bytes = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function validateCsrfToken(
  cookieToken: string | undefined,
  headerToken: string | undefined
): boolean {
  if (!cookieToken || !headerToken) {
    return false;
  }
  return cookieToken === headerToken;
}

export async function getCsrfTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value;
}

export function csrfCookieSet(token: string): string {
  const secure = process.env.NODE_ENV === 'production';
  return `${CSRF_COOKIE_NAME}=${token}; Path=/; SameSite=Strict; Secure=${secure}; Max-Age=3600`;
}

export function csrfCookieClear(): string {
  return `${CSRF_COOKIE_NAME}=; Path=/; Max-Age=0`;
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
