import { NextRequest, NextResponse } from 'next/server';
import { getFeed } from '@/services/feed.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const feed = await getFeed({
    limit: Math.min(Number(searchParams.get('limit')) || 20, 100),
    offset: Number(searchParams.get('offset')) || 0,
    type: searchParams.get('type') ?? undefined,
    tag: searchParams.get('tag') ?? undefined,
    verified: searchParams.get('verified') === 'true',
    sort: searchParams.get('sort') ?? 'recent',
  });

  return NextResponse.json(feed);
}
