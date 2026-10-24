import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const subtotal = parseFloat(searchParams.get('subtotal') || '0');

  if (!code) {
    return NextResponse.json({ valid: false, message: 'Coupon code is required.' }, { status: 400 });
  }

  const result = await dbService.validateCoupon(code, subtotal);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = body.code;
    const subtotal = parseFloat(body.order_subtotal || body.subtotal || '0');

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Coupon code is required.' }, { status: 400 });
    }

    const result = await dbService.validateCoupon(code, subtotal);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ valid: false, message: err.message || 'Invalid coupon request.' }, { status: 400 });
  }
}
