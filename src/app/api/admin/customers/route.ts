import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;

    const customers = await dbService.getCustomers(query);

    return NextResponse.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to retrieve customer accounts.' },
      { status: 500 }
    );
  }
}
