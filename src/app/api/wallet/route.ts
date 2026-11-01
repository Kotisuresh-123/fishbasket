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

    const wallet = await dbService.getWallet(session.userId);
    if (!wallet) {
      return NextResponse.json(
        { success: false, message: 'Wallet not found for user account.' },
        { status: 404 }
      );
    }

    const transactions = await dbService.getWalletTransactions(session.userId, 50);

    return NextResponse.json({
      success: true,
      wallet,
      transactions,
    });
  } catch (err: any) {
    console.error('Wallet GET error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve wallet information.' },
      { status: 500 }
    );
  }
}
