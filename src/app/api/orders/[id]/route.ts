import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await dbService.getOrderById(id);

  if (!order) {
    return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, order });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 0. Atomic Claim Delivery action
    if (body.action === 'claim' || body.action === 'accept') {
      const partnerId = body.deliveryPartnerId || body.requesterId;
      if (!partnerId) {
        return NextResponse.json(
          { success: false, message: 'Delivery partner ID is required to accept this delivery.' },
          { status: 400 }
        );
      }
      const result = await dbService.claimDelivery(id, partnerId);
      if (!result.success) {
        return NextResponse.json({ success: false, message: result.message }, { status: 409 });
      }
      return NextResponse.json({ success: true, order: result.order, message: result.message });
    }

    // 1. COD Payment Collection action
    if (body.action === 'collect_cod' || body.collectCod) {
      const result = await dbService.markCodPaymentCollected(
        id,
        body.collectedByUserId || 'u3', // default to delivery partner u3 if not specified
        body.notes
      );
      if (!result.success) {
        return NextResponse.json({ success: false, message: result.message }, { status: 403 });
      }
      return NextResponse.json({ success: true, order: result.order });
    }

    // 2. Order status update with role validation
    if (body.status) {
      const result = await dbService.updateOrderStatus(
        id,
        body.status,
        body.notes,
        body.requesterId,
        body.requesterRole,
        { isManualCorrection: body.isManualCorrection }
      );
      if (!result.success) {
        return NextResponse.json({ success: false, message: result.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, order: result.order });
    }

    // 3. Assign delivery partner
    if (body.deliveryPartnerId) {
      const assigned = await dbService.assignDeliveryPartner(id, body.deliveryPartnerId);
      return NextResponse.json({ success: true, order: assigned });
    }

    return NextResponse.json({ success: false, message: 'No valid action provided' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
