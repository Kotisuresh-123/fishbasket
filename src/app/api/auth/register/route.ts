import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { setSessionCookie } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { email, full_name, phone, password, auth_id } = await request.json();

    if (!email || !full_name || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const regResult = await dbService.registerCustomer({
      email,
      full_name,
      phone: phone || '',
      password,
      auth_id,
    });

    if (!regResult.success || !regResult.user) {
      return NextResponse.json(
        { success: false, message: regResult.message || 'Registration failed.' },
        { status: 400 }
      );
    }

    const { password_hash, ...safeUser } = regResult.user;

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Account created successfully! Welcome to Fish Basket.',
    });

    setSessionCookie(response, {
      userId: safeUser.id,
      email: safeUser.email,
      role: safeUser.role as any,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Internal registration error.' },
      { status: 500 }
    );
  }
}
