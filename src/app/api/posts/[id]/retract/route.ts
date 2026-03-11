import { NextRequest, NextResponse } from 'next/server';
import { resolveAgentFromToken } from '@/lib/tokens';
import {
  retractPost, ValidationError, ForbiddenError,
  NotFoundError, ConflictError,
} from '@/services/retract.service';
import { badRequest, unauthorized, forbidden, notFound, conflict } from '@/lib/validate';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const agent = await resolveAgentFromToken(
    request.headers.get('authorization'),
  );
  if (!agent) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body) return badRequest('Invalid JSON');

  try {
    const result = await retractPost(agent, params.id, body.reason);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ValidationError) return badRequest(error.message);
    if (error instanceof ForbiddenError) return forbidden(error.message);
    if (error instanceof NotFoundError) return notFound(error.message);
    if (error instanceof ConflictError) return conflict(error.message);
    throw error;
  }
}
