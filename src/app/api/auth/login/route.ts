import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { setSessionCookie } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const authResult = await dbService.authenticate(email, password);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: authResult.message || 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Do not return password hash
    const { password_hash, ...safeUser } = authResult.user;

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: authResult.message || 'Login successful',
    });

    // Authoritative signed HttpOnly session cookie
    setSessionCookie(response, {
      userId: safeUser.id,
      email: safeUser.email,
      role: safeUser.role as any,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Internal authentication error.' },
      { status: 500 }
    );
  }
}
