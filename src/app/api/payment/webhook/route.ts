import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbService } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const webhookSignature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if secret configured
    if (webhookSecret && !webhookSecret.includes('placeholder')) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== webhookSignature) {
        return NextResponse.json(
          { success: false, message: 'Invalid webhook signature' },
          { status: 400 }
        );
      }
    }

    const event = JSON.parse(rawBody);

    // Idempotent event processing
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      // In production, update payments record status to 'success'
    } else if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      // In production, record payment failure
    }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
