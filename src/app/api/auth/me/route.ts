import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
  }

  const profile = await dbService.getProfileById(session.userId);
  if (!profile) {
    return NextResponse.json({ success: false, message: 'User profile not found' }, { status: 404 });
  }

  const { password_hash, ...safeUser } = profile;
  return NextResponse.json({ success: true, user: safeUser });
}
