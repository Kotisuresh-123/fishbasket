import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || request.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
  }

  const profile = await dbService.getProfileById(userId);
  if (!profile) {
    return NextResponse.json({ success: false, message: 'User profile not found' }, { status: 404 });
  }

  const { password_hash, ...safeUser } = profile;
  return NextResponse.json({ success: true, user: safeUser });
}
