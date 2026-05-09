import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { csrfMiddleware, addCsrfToResponse } from '@/middleware/csrf';
import { applyCors, handleCorsPreflight } from '@/lib/cors';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/properties',
  '/tenants',
  '/leases',
  '/payments',
  '/reports',
  '/notifications',
  '/settings',
  '/prospects',
  '/import',
];

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/inquiry',
  '/register',
  '/jv',
  '/rooms',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    const preflight = handleCorsPreflight(request);
    if (preflight) {
      return preflight;
    }

    const csrfResponse = csrfMiddleware(request);
    if (csrfResponse) {
      const corsResponse = applyCors(request, csrfResponse);
      return corsResponse;
    }

    // Rate limiting for specific API routes
    if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/register')) {
      const limit = rateLimit(request, 'auth');
      const rlResponse = rateLimitResponse(limit);
      if (rlResponse) {
        const corsResponse = new NextResponse(rlResponse.body, { status: rlResponse.status, headers: rlResponse.headers });
        return applyCors(request, corsResponse);
      }
    }

    if (pathname.startsWith('/api/ai/chat')) {
      const limit = rateLimit(request, 'ai');
      const rlResponse = rateLimitResponse(limit);
      if (rlResponse) {
        const corsResponse = new NextResponse(rlResponse.body, { status: rlResponse.status, headers: rlResponse.headers });
        return applyCors(request, corsResponse);
      }
    }

    if (pathname.startsWith('/api/v1/')) {
      const limit = rateLimit(request, 'api');
      const rlResponse = rateLimitResponse(limit);
      if (rlResponse) {
        const corsResponse = new NextResponse(rlResponse.body, { status: rlResponse.status, headers: rlResponse.headers });
        return applyCors(request, corsResponse);
      }
    }

    const response = NextResponse.next();
    addCsrfToResponse(response, request);

    if (pathname.startsWith('/api/v1') || pathname.startsWith('/api/cron')) {
      applyCors(request, response);
    }

    return response;
  }

  // Protect dashboard routes
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  if (isProtected) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from login page
  if (isPublic && pathname.startsWith('/auth/')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico|sitemap|robots.txt).*)'],
};
