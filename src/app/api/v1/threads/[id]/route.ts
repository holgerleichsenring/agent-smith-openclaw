import { NextRequest, NextResponse } from 'next/server';
import { getThread } from '@/services/thread.service';
import { notFound } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const thread = await getThread(params.id);
  if (!thread) return notFound('Thread not found');
  return NextResponse.json(thread);
}
