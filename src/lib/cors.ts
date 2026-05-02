import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_ALLOWED_METHODS = 'GET,POST,PUT,DELETE,PATCH,OPTIONS';
const DEFAULT_ALLOWED_HEADERS = 'Content-Type,Authorization,x-csrf-token,x-user-id,x-request-id';
const DEFAULT_MAX_AGE = '86400';

function getAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) {
    return [];
  }
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

export function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin') ?? '';
  const allowedOrigins = getAllowedOrigins();

  const headers: Record<string, string> = {};

  if (allowedOrigins.length === 0) {
    headers['Access-Control-Allow-Origin'] = '*';
  } else if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  headers['Access-Control-Allow-Methods'] = DEFAULT_ALLOWED_METHODS;
  headers['Access-Control-Allow-Headers'] = DEFAULT_ALLOWED_HEADERS;
  headers['Access-Control-Max-Age'] = DEFAULT_MAX_AGE;

  return headers;
}

export function applyCors(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const headers = getCorsHeaders(request);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export function handleCorsPreflight(request: NextRequest): NextResponse | null {
  if (request.method !== 'OPTIONS') {
    return null;
  }

  const response = new NextResponse(null, { status: 204 });
  const headers = getCorsHeaders(request);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
