import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status || !['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be pending, approved, rejected, or suspended.' },
        { status: 400 }
      );
    }

    const updated = await dbService.updateDeliveryPartnerStatus(id, status);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Delivery partner account not found.' },
        { status: 404 }
      );
    }

    const { password_hash, ...safeUser } = updated;

    return NextResponse.json({
      success: true,
      partner: safeUser,
      message: `Delivery partner account status updated to ${status}.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Error updating delivery partner status.' },
      { status: 500 }
    );
  }
}
