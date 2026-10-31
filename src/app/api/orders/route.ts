import { NextResponse } from 'next/server';
import { dbService, toDbId } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';

export async function GET(request: Request) {
  // 1. Authoritative server-side session verification
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Authentication required. Please sign in.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const requestedUserId = searchParams.get('userId') || undefined;
  const requestedFishermanId = searchParams.get('fishermanId') || undefined;
  const requestedDeliveryPartnerId = searchParams.get('deliveryPartnerId') || undefined;
  const available =
    searchParams.get('available') === 'true' ||
    searchParams.get('isAvailableForDelivery') === 'true';
  const status = searchParams.get('status') || undefined;

  let queryUserId: string | undefined = undefined;
  let queryFishermanId: string | undefined = undefined;
  let queryDeliveryPartnerId: string | undefined = undefined;
  let queryAvailable: boolean = false;

  // 2. Strict Role-Based Order Isolation
  if (session.role === 'customer') {
    // Customers can ONLY EVER retrieve their own orders.
    // If a client supplies a conflicting userId, reject immediately with 403 Forbidden.
    if (requestedUserId && toDbId(requestedUserId) !== toDbId(session.userId)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. You are not authorized to view another customer\'s orders.' },
        { status: 403 }
      );
    }
    // Block customers from accessing commercial fisherman or delivery dispatch filters
    if (requestedFishermanId || requestedDeliveryPartnerId || available) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Unauthorized order filter for customer role.' },
        { status: 403 }
      );
    }
    // Always enforce the authenticated customer ID
    queryUserId = session.userId;
  } else if (session.role === 'fisherman') {
    // Fishermen can view orders containing their catches
    if (requestedFishermanId && toDbId(requestedFishermanId) !== toDbId(session.userId)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden. You are not authorized to view another fisherman\'s catches.' },
        { status: 403 }
      );
    }
    queryFishermanId = session.userId;
  } else if (session.role === 'delivery_partner') {
    // Delivery partners can view available unassigned dispatches or their own assigned deliveries
    if (available) {
      queryAvailable = true;
    } else {
      if (requestedDeliveryPartnerId && toDbId(requestedDeliveryPartnerId) !== toDbId(session.userId)) {
        return NextResponse.json(
          { success: false, message: 'Forbidden. You are not authorized to view another driver\'s assignments.' },
          { status: 403 }
        );
      }
      queryDeliveryPartnerId = session.userId;
    }
  } else if (session.role === 'admin') {
    // Admins retain full authorized access to the complete order pipeline
    queryUserId = requestedUserId;
    queryFishermanId = requestedFishermanId;
    queryDeliveryPartnerId = requestedDeliveryPartnerId;
    queryAvailable = available;
  } else {
    return NextResponse.json(
      { success: false, message: 'Forbidden. Unrecognized user role.' },
      { status: 403 }
    );
  }

  const orders = await dbService.getOrders(queryUserId, queryFishermanId, queryDeliveryPartnerId, {
    isAvailableForDelivery: queryAvailable,
    status: status as any,
  });

  return NextResponse.json({ success: true, orders });
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to place an order. Please sign in.' },
        { status: 401 }
      );
    }

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

    // Authoritatively enforce the verified session user ID
    body.user_id = session.userId;
    if (session.email && !body.customer_email) {
      body.customer_email = session.email;
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
