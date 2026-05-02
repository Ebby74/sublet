import { NextRequest, NextResponse } from 'next/server';
import {
  generateCsrfToken,
  validateCsrfToken,
  csrfCookieSet,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from '@/lib/csrf';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const AUTH_PATH_PREFIX = '/api/auth';
const CRON_PATH_PREFIX = '/api/cron';

export function csrfMiddleware(request: NextRequest): NextResponse | null {
  if (SAFE_METHODS.has(request.method)) {
    return null;
  }

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith(AUTH_PATH_PREFIX) ||
    pathname.startsWith(CRON_PATH_PREFIX)
  ) {
    return null;
  }

  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME) ?? undefined;

  if (!validateCsrfToken(cookieToken, headerToken)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }

  return null;
}

export function addCsrfToResponse(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  const existingToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const token = existingToken || generateCsrfToken();

  if (!existingToken) {
    response.headers.append('Set-Cookie', csrfCookieSet(token));
  }

  return response;
}
