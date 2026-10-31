import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const SESSION_COOKIE_NAME = 'fishbasket_session';
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days in seconds

export interface SessionPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin' | 'fisherman' | 'delivery_partner';
  exp: number; // Unix timestamp in milliseconds
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      'CRITICAL CONFIGURATION ERROR: SESSION_SECRET environment variable is not configured. ' +
      'Please configure a strong random SESSION_SECRET in server environment variables or Vercel project settings.'
    );
  }
  return secret;
}

/**
 * Creates a cryptographically signed session token using HMAC-SHA256.
 */
export function createSessionToken(data: Omit<SessionPayload, 'exp'>): string {
  const secret = getSessionSecret();
  const payload: SessionPayload = {
    ...data,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payloadBase64).digest('base64url');
  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies a session token using constant-time comparison and validates expiration.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signature] = parts;
  if (!payloadBase64 || !signature) return null;

  try {
    const secret = getSessionSecret();
    const expectedSignature = crypto.createHmac('sha256', secret).update(payloadBase64).digest('base64url');

    const sigBuf = Buffer.from(signature, 'utf-8');
    const expBuf = Buffer.from(expectedSignature, 'utf-8');

    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson) as SessionPayload;

    if (!payload.userId || !payload.email || !payload.role || !payload.exp) {
      return null;
    }

    if (Date.now() > payload.exp) {
      return null; // Expired session
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Sets the secure HttpOnly session cookie on a NextResponse object.
 */
export function setSessionCookie(response: NextResponse, data: Omit<SessionPayload, 'exp'>): void {
  const token = createSessionToken(data);
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Expires and clears the session cookie on a NextResponse object.
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
}

/**
 * Authoritatively retrieves and verifies the current session from Request cookies or Next.js headers.
 */
export async function getSessionFromRequest(request?: Request): Promise<SessionPayload | null> {
  // 1. Try reading from request parameter if provided
  if (request) {
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
      if (match) {
        const token = match.substring(`${SESSION_COOKIE_NAME}=`.length);
        const verified = verifySessionToken(token);
        if (verified) return verified;
      }
    }
  }

  // 2. Try reading from Next.js server cookies() (supports Route Handlers & Server Components)
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (cookie?.value) {
      return verifySessionToken(cookie.value);
    }
  } catch {
    // cookies() unavailable in non-request contexts
  }

  return null;
}

