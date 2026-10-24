import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { Order } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || undefined;
  const fishermanId = searchParams.get('fishermanId') || undefined;
  const deliveryPartnerId = searchParams.get('deliveryPartnerId') || undefined;
  const available =
    searchParams.get('available') === 'true' ||
    searchParams.get('isAvailableForDelivery') === 'true';
  const status = searchParams.get('status') || undefined;

  const orders = await dbService.getOrders(userId, fishermanId, deliveryPartnerId, {
    isAvailableForDelivery: available,
    status: status as any,
  });
  return NextResponse.json({ success: true, orders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart cannot be empty to place an order.' },
        { status: 400 }
      );
    }

    if (!body.delivery_address || !body.delivery_address.pincode) {
      return NextResponse.json(
        { success: false, message: 'Delivery address with PIN code is required.' },
        { status: 400 }
      );
    }

    const result = await dbService.createOrder(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Failed to place order.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      message: 'Order created successfully!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
