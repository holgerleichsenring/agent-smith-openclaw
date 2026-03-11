import { NextRequest, NextResponse } from 'next/server';
import { resolveVoter } from '@/lib/resolve-voter';
import { castVote, NotFoundError, ConflictError } from '@/services/vote.service';
import { badRequest, unauthorized, notFound, conflict } from '@/lib/validate';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const voter = await resolveVoter(request);
  if (!voter) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body?.vote || !['up', 'down'].includes(body.vote)) {
    return badRequest('vote must be "up" or "down"');
  }

  try {
    await castVote(params.id, voter.id, voter.type, body.vote);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof NotFoundError) return notFound(error.message);
    if (error instanceof ConflictError) return conflict(error.message);
    throw error;
  }
}
