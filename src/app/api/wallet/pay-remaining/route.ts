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

    const body = await request.json();
    const orderId = body.orderId || body.order_id;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Missing order identifier.' },
        { status: 400 }
      );
    }

    const result = await dbService.payRemainingBalanceWithWallet(orderId, session.userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Failed to pay remaining balance.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      message: result.message,
    });
  } catch (err: any) {
    console.error('Pay remaining error:', err);
    return NextResponse.json(
      { success: false, message: 'Server error processing payment: ' + (err.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
