import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { amount, currency = 'INR', receipt } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If Razorpay live/test credentials are configured, initialize real order
    if (keyId && keySecret && !keyId.includes('placeholder')) {
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // in paise
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
        }),
      });
      const rzpData = await rzpRes.json();
      return NextResponse.json({ success: true, order: rzpData, mode: 'razorpay_live' });
    }

    // Isolated Development / Test Mock Mode (as requested by Section 11 & Section 23)
    const mockOrderId = 'order_mock_' + crypto.randomBytes(8).toString('hex');
    return NextResponse.json({
      success: true,
      order: {
        id: mockOrderId,
        entity: 'order',
        amount: Math.round(amount * 100),
        amount_paid: 0,
        amount_due: Math.round(amount * 100),
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        status: 'created',
        attempts: 0,
        created_at: Math.floor(Date.now() / 1000),
      },
      mode: 'development_mock',
      notice: 'Razorpay running in verified development test mode. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local for production gateway.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Payment creation failed' },
      { status: 500 }
    );
  }
}
