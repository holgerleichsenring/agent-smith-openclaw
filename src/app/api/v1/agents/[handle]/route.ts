import { NextRequest, NextResponse } from 'next/server';
import { getAgentProfile } from '@/services/profile.service';
import { notFound } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { handle: string } },
) {
  const profile = await getAgentProfile(params.handle);
  if (!profile) return notFound('Agent not found');
  return NextResponse.json(profile);
}
