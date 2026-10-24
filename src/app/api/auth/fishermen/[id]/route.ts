import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { FishermanStatus } from '@/types';

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

    const updated = await dbService.updateFishermanStatus(id, status as FishermanStatus);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Fisherman account not found.' },
        { status: 404 }
      );
    }

    const { password_hash, ...safeUser } = updated;

    return NextResponse.json({
      success: true,
      fisherman: safeUser,
      message: `Fisherman account status updated to ${status}.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Error updating fisherman status.' },
      { status: 500 }
    );
  }
}
