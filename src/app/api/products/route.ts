import { NextResponse } from 'next/server';
import { dbService, toDbId, toAppId } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('q') || undefined;
  const freshness = searchParams.get('freshness') || undefined;
  const fishermanId = searchParams.get('fishermanId') || undefined;

  let products = await dbService.getProducts({
    categorySlug: category,
    search,
    freshness,
  });

  if (fishermanId) {
    const dbFid = toDbId(fishermanId);
    const appFid = toAppId(fishermanId);
    products = products.filter(
      (p) => p.fisherman_id === fishermanId || p.fisherman_id === dbFid || p.fisherman_id === appFid
    );
  }

  return NextResponse.json({ success: true, count: products.length, products });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fishermanId = body.fisherman_id || body.requesterId;
    const role = body.requesterRole || 'fisherman';

    if (!fishermanId) {
      return NextResponse.json(
        { success: false, errorType: 'unauthenticated', message: 'Authentication required. Missing fisherman identification.' },
        { status: 401 }
      );
    }

    // Server-side authoritative verification of fisherman profile and status
    const fisherman = await dbService.getProfileById(fishermanId);
    if (!fisherman) {
      return NextResponse.json(
        { success: false, errorType: 'account_not_found', message: 'Fisherman profile was not found in the database.' },
        { status: 404 }
      );
    }

    if (fisherman.role !== 'fisherman' && fisherman.role !== 'admin') {
      return NextResponse.json(
        { success: false, errorType: 'unauthorized_role', message: 'Only registered fishermen are authorized to create seafood listings.' },
        { status: 403 }
      );
    }

    // Verify approval status
    if (fisherman.role === 'fisherman' && fisherman.status !== 'approved') {
      return NextResponse.json(
        {
          success: false,
          errorType: 'approval_required',
          status: fisherman.status,
          message: `Your account is currently ${fisherman.status}. Only admin-approved fishermen can publish fresh catches.`,
        },
        { status: 403 }
      );
    }

    // Validate essential product fields
    if (!body.name || !body.price_per_unit || !body.category_id) {
      return NextResponse.json(
        { success: false, errorType: 'validation_error', message: 'Please provide product name, price, and category.' },
        { status: 400 }
      );
    }

    // Associate product with verified fisherman profile
    const productPayload = {
      ...body,
      fisherman_id: fisherman.id,
      seller_name: fisherman.display_name || fisherman.full_name,
    };

    const result = await dbService.createProduct(productPayload, fisherman.id, fisherman.role);

    if (!result.success) {
      return NextResponse.json(
        { success: false, errorType: 'creation_failed', message: result.message || 'Failed to save product.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      product: result.product,
      message: 'Catch published successfully!',
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, errorType: 'server_error', message: err.message }, { status: 500 });
  }
}
