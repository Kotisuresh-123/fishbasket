import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET() {
  try {
    const fishermen = await dbService.getFishermen();
    const safeFishermen = fishermen.map(({ password_hash, ...rest }) => rest);
    return NextResponse.json({ success: true, count: safeFishermen.length, fishermen: safeFishermen });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
