import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET() {
  try {
    const partners = await dbService.getDeliveryPartners();
    const safePartners = partners.map(({ password_hash, ...rest }) => rest);
    return NextResponse.json({ success: true, count: safePartners.length, partners: safePartners });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
