import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import { dbService } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    if (session.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Operations reserved for administration.' },
        { status: 403 }
      );
    }

    const data = await dbService.getAllWalletsAndLedger(100);

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    console.error('Admin wallets GET error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve marketplace wallet audit data.' },
      { status: 500 }
    );
  }
}
