import { describe, it, expect, beforeAll, vi } from 'vitest';
import {
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
  getSessionFromRequest,
} from '../session';
import { dbService } from '@/lib/db';
import { NextRequest } from 'next/server';
import { GET as getOrders } from '@/app/api/orders/route';
import { GET as getOrderById } from '@/app/api/orders/[id]/route';
import { POST as postLogout } from '@/app/api/auth/logout/route';
import { GET as getAuthMe } from '@/app/api/auth/me/route';

beforeAll(() => {
  process.env.SESSION_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
});

describe('Signed HttpOnly Session Security & Token Verification', () => {
  it('creates and verifies a valid HMAC-SHA256 session token', () => {
    const payload = {
      userId: 'test-user-uuid-1234',
      email: 'customer@fishbasket.in',
      role: 'customer' as const,
    };

    const token = createSessionToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(2);

    const verified = verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.role).toBe(payload.role);
    expect(verified?.exp).toBeGreaterThan(Date.now());
  });

  it('rejects tampered signature with constant-time comparison', () => {
    const payload = {
      userId: 'test-user-uuid-1234',
      email: 'customer@fishbasket.in',
      role: 'customer' as const,
    };

    const token = createSessionToken(payload);
    const parts = token.split('.');
    // Tamper with the signature
    const tamperedSig = parts[1].slice(0, -2) + 'aa';
    const tamperedToken = `${parts[0]}.${tamperedSig}`;

    const verified = verifySessionToken(tamperedToken);
    expect(verified).toBeNull();
  });

  it('rejects tampered payload', () => {
    const payload = {
      userId: 'test-user-uuid-1234',
      email: 'customer@fishbasket.in',
      role: 'customer' as const,
    };

    const token = createSessionToken(payload);
    const parts = token.split('.');
    // Tamper with the base64 payload to change role to admin
    const fakePayload = Buffer.from(JSON.stringify({ ...payload, role: 'admin' })).toString('base64url');
    const tamperedToken = `${fakePayload}.${parts[1]}`;

    const verified = verifySessionToken(tamperedToken);
    expect(verified).toBeNull();
  });

  it('rejects expired session token', () => {
    const payload = {
      userId: 'test-user-uuid-1234',
      email: 'customer@fishbasket.in',
      role: 'customer' as const,
    };

    // Create token with timestamp 10 days in the past (beyond 7-day max-age)
    const tenDaysAgoSeconds = Math.floor(Date.now() / 1000) - 10 * 24 * 60 * 60;
    const jsonStr = JSON.stringify(payload);
    const payloadB64 = Buffer.from(jsonStr).toString('base64url');
    const crypto = require('crypto');
    const secret = process.env.SESSION_SECRET || 'fallback-test-secret-min-32-chars-long!';
    const signature = crypto.createHmac('sha256', secret).update(`${payloadB64}.${tenDaysAgoSeconds}`).digest('base64url');
    const expiredToken = `${payloadB64}.${tenDaysAgoSeconds}.${signature}`;

    const verified = verifySessionToken(expiredToken);
    expect(verified).toBeNull();
  });

  it('extracts session accurately from request cookie', async () => {
    const token = createSessionToken({
      userId: 'test-user-uuid-1234',
      email: 'customer@fishbasket.in',
      role: 'customer',
    });

    const req = new NextRequest('http://localhost:3000/api/auth/me', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${token}`,
      },
    });

    const session = await getSessionFromRequest(req);
    expect(session).not.toBeNull();
    expect(session?.userId).toBe('test-user-uuid-1234');
    expect(session?.role).toBe('customer');
  });

  it('returns null session when cookie is absent or invalid', async () => {
    const reqNoCookie = new NextRequest('http://localhost:3000/api/auth/me');
    expect(await getSessionFromRequest(reqNoCookie)).toBeNull();

    const reqInvalidCookie = new NextRequest('http://localhost:3000/api/auth/me', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=garbage_token_value`,
      },
    });
    expect(await getSessionFromRequest(reqInvalidCookie)).toBeNull();
  });
});

describe('API Authorization & Customer Order Isolation', () => {
  it('blocks unauthenticated requests to /api/orders with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/orders', { method: 'GET' });
    const res = await getOrders(req);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message || body.error).toContain('Authentication required');
  });

  it('blocks customer from accessing another customer orders via query param with 403', async () => {
    const customerToken = createSessionToken({
      userId: 'customer-uuid-1111',
      email: 'suresh@example.com',
      role: 'customer',
    });

    // Customer 1 attempting to pass Customer 2's userId in query string
    const req = new NextRequest('http://localhost:3000/api/orders?userId=customer-uuid-2222', {
      method: 'GET',
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${customerToken}`,
      },
    });

    const res = await getOrders(req);
    expect(res.status).toBe(403);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message || body.error).toContain('Forbidden');
  });

  it('blocks unauthenticated requests to /api/orders/[id] with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/orders/ord-999', { method: 'GET' });
    const res = await getOrderById(req, { params: Promise.resolve({ id: 'ord-999' }) });
    expect(res.status).toBe(401);
  });

  it('clears session cookie on /api/auth/logout', async () => {
    const res = await postLogout();
    expect(res.status).toBe(200);

    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain('fishbasket_session=');
    expect(setCookie).toContain('Max-Age=0');
  });

  it('returns authenticated user details on /api/auth/me with valid session cookie', async () => {
    vi.spyOn(dbService, 'getProfileById').mockResolvedValueOnce({
      id: 'customer-uuid-1111',
      email: 'suresh@example.com',
      full_name: 'Suresh Kumar',
      phone: '9876543210',
      role: 'customer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any);

    const token = createSessionToken({
      userId: 'customer-uuid-1111',
      email: 'suresh@example.com',
      role: 'customer',
    });

    const req = new NextRequest('http://localhost:3000/api/auth/me', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${token}`,
      },
    });

    const res = await getAuthMe(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.user.email).toBe('suresh@example.com');
    expect(body.user.role).toBe('customer');
  });

  it('rejects /api/auth/me with 401 if unauthenticated', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/me');
    const res = await getAuthMe(req);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.success).toBe(false);
  });
});
