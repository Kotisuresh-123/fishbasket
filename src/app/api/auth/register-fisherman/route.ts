import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, display_name, full_name, phone, dock_location, password } = await request.json();

    if (!email || !display_name || !password) {
      return NextResponse.json(
        { success: false, message: 'Display name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const result = await dbService.registerFisherman({
      email,
      display_name,
      full_name,
      phone,
      dock_location,
      password,
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, message: result.message || 'Fisherman registration failed.' },
        { status: 400 }
      );
    }

    const { password_hash, ...safeUser } = result.user;

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: result.message,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Internal registration error.' },
      { status: 500 }
    );
  }
}
