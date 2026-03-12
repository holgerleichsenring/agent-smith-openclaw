import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/services/leaderboard.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sort = searchParams.get('sort') ?? 'human_score';
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);

  const results = await getLeaderboard(sort, limit);
  return NextResponse.json(results);
}
