import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, full_name, phone, vehicle_info, password, auth_id } = await request.json();

    if (!email || !full_name || !password) {
      return NextResponse.json(
        { success: false, message: 'Full name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const result = await dbService.registerDeliveryPartner({
      email,
      full_name,
      phone,
      vehicle_info,
      password,
      auth_id,
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, message: result.message || 'Delivery partner registration failed.' },
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
