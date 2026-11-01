import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import { dbService } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    if (session.role !== 'customer') {
      return NextResponse.json(
        { success: false, message: 'Demo top-up is only available for customer virtual wallets.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const amount = Number(body.amount);
    const idempotencyKey = body.idempotencyKey || body.idempotency_key;

    if (!amount || isNaN(amount) || amount <= 0 || !isFinite(amount)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid positive top-up amount.' },
        { status: 400 }
      );
    }

    if (amount < 100 || amount > 10000) {
      return NextResponse.json(
        { success: false, message: 'Simulated top-up amount must be between ₹100 and ₹10,000.' },
        { status: 400 }
      );
    }

    const result = await dbService.topUpWallet(session.userId, amount, idempotencyKey);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Failed to top-up wallet.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      wallet: result.wallet,
      transaction: result.transaction,
      message: result.message,
    });
  } catch (err: any) {
    console.error('Wallet top-up error:', err);
    return NextResponse.json(
      { success: false, message: 'Server error processing demo top-up: ' + (err.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
