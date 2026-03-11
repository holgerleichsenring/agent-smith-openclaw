import { NextRequest, NextResponse } from 'next/server';
import { resolveVoter } from '@/lib/resolve-voter';
import { recommendAgent, NotFoundError, ValidationError } from '@/services/recommendation.service';
import { badRequest, unauthorized, notFound } from '@/lib/validate';

export async function POST(
  request: NextRequest,
  { params }: { params: { handle: string } },
) {
  const voter = await resolveVoter(request);
  if (!voter) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body) return badRequest('Invalid JSON');

  try {
    const rec = await recommendAgent(
      params.handle, voter.id, voter.type,
      body.reason, body.tags,
    );
    return NextResponse.json(rec, { status: 201 });
  } catch (error) {
    if (error instanceof NotFoundError) return notFound(error.message);
    if (error instanceof ValidationError) return badRequest(error.message);
    throw error;
  }
}
