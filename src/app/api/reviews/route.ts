import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId') || undefined;
  const fishermanId = searchParams.get('fishermanId') || undefined;
  const checkUserId = searchParams.get('checkUserId') || undefined;

  // If client is checking whether a user is eligible to review a product:
  if (checkUserId && productId) {
    const eligibility = await dbService.canUserReviewProduct(checkUserId, productId);
    return NextResponse.json({ success: true, ...eligibility });
  }

  const reviews = await dbService.getReviews(productId, fishermanId);
  return NextResponse.json({ success: true, reviews });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await dbService.addVerifiedReview(body);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, review: result.review, message: result.message });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
