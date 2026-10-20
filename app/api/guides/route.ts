import { NextResponse } from 'next/server';
import { getAllGuides } from '@/lib/guides';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const guides = getAllGuides();
    return NextResponse.json(guides);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load guides' }, { status: 500 });
  }
}
