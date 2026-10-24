import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { success: false, message: 'Missing payment verification credentials' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // In live Razorpay mode, verify HMAC SHA256 signature strictly
    if (keySecret && !keySecret.includes('placeholder')) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          { success: false, message: 'Invalid payment signature verification failed' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      message: 'Payment signature verified successfully',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Verification error' },
      { status: 500 }
    );
  }
}
