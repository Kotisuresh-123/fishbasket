import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email address is required.' },
        { status: 400 }
      );
    }

    const result = await dbService.createPasswordResetToken(email);

    return NextResponse.json({
      success: true,
      message: result.message,
      token: result.token, // Return token for development/demo testing
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Error processing request.' },
      { status: 500 }
    );
  }
}
