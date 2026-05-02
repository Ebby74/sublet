/**
 * Simple session management using cookies
 * Note: For production, use Redis or database-backed sessions
 */

const SESSION_COOKIE_NAME = 'session_id';

export function createSessionCookie(userId: string, email: string) {
  const sessionData = Buffer.from(JSON.stringify({ userId, email })).toString('base64');
  return `${SESSION_COOKIE_NAME}=${sessionData}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

export function parseSessionCookie(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split('; ').reduce((acc, c) => {
    const [key, value] = c.split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  return cookies[SESSION_COOKIE_NAME] || null;
}