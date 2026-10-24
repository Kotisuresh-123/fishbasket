import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await dbService.getProductById(id);

  if (!product) {
    return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, product });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const requesterId = body.requesterId || body.fisherman_id;
    const requesterRole = body.requesterRole || 'fisherman';

    const result = await dbService.updateProduct(id, body, requesterId, requesterRole);

    if (!result.success) {
      const isAuthError = result.message?.toLowerCase().includes('unauthorized') || result.message?.toLowerCase().includes('forbidden');
      return NextResponse.json({ success: false, message: result.message }, { status: isAuthError ? 403 : 400 });
    }

    return NextResponse.json({ success: true, product: result.product, message: 'Listing updated successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const requesterId = searchParams.get('requesterId') || undefined;
    const requesterRole = (searchParams.get('requesterRole') as any) || 'fisherman';

    const result = await dbService.deleteProduct(id, requesterId, requesterRole);

    if (!result.success) {
      const isAuthError = result.message?.toLowerCase().includes('unauthorized') || result.message?.toLowerCase().includes('forbidden');
      return NextResponse.json({ success: false, message: result.message }, { status: isAuthError ? 403 : 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
