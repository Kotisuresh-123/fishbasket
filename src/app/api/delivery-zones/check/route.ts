import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get('pincode');

  if (!pincode) {
    return NextResponse.json({ serviceable: false, message: 'PIN code is required' }, { status: 400 });
  }

  const zone = await dbService.checkPincodeServiceability(pincode);

  if (zone) {
    return NextResponse.json({
      serviceable: true,
      zone,
      message: `Delivery available in ${zone.area_name} within ${zone.estimated_delivery_hours} hours.`,
    });
  }

  return NextResponse.json({
    serviceable: false,
    message: 'Sorry, this area is not currently covered by our fresh cold-chain network.',
  });
}
