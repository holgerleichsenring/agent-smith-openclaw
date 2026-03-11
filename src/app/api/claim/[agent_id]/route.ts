import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, SessionWithOwner } from '@/lib/auth';
import { claimAgent, NotFoundError, ConflictError } from '@/services/claim.service';
import { unauthorized, notFound, conflict } from '@/lib/validate';

export async function GET(
  _request: NextRequest,
  { params }: { params: { agent_id: string } },
) {
  const session = await getServerSession(authOptions) as SessionWithOwner | null;
  if (!session?.owner_id) return unauthorized();

  try {
    const result = await claimAgent(params.agent_id, session.owner_id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof NotFoundError) return notFound(error.message);
    if (error instanceof ConflictError) return conflict(error.message);
    throw error;
  }
}
