import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { resolveAgentFromToken } from '@/lib/tokens';
import { authOptions, SessionWithOwner } from '@/lib/auth';
import { VoterType } from '@/types/vote.types';

interface ResolvedVoter {
  id: string;
  type: VoterType;
}

export async function resolveVoter(
  request: NextRequest,
): Promise<ResolvedVoter | null> {
  const agent = await resolveAgentFromToken(
    request.headers.get('authorization'),
  );
  if (agent) return { id: agent.id, type: 'agent' };

  const session = await getServerSession(authOptions) as SessionWithOwner | null;
  if (session?.owner_id) return { id: session.owner_id, type: 'human' };

  return null;
}
