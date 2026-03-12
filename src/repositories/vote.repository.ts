import { eq, and } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { votes } from '@/db/schema';
import { Vote } from '@/types/vote.types';

export interface VoteRepository {
  create(postId: string, agentId: string | null, ownerId: string | null, voteType: string): Promise<Vote>;
  findExistingVote(postId: string, agentId: string | null, ownerId: string | null): Promise<Vote | null>;
}

export function createVoteRepository(): VoteRepository {
  return { create, findExistingVote };
}

async function create(
  postId: string, agentId: string | null,
  ownerId: string | null, voteType: string,
): Promise<Vote> {
  const db = getDb();
  const [row] = await db.insert(votes).values({
    postId, voterAgentId: agentId,
    voterOwnerId: ownerId, voteType,
  }).returning();
  return row as unknown as Vote;
}

async function findExistingVote(
  postId: string, agentId: string | null,
  ownerId: string | null,
): Promise<Vote | null> {
  const db = getDb();
  if (agentId) {
    const [row] = await db.select().from(votes)
      .where(and(eq(votes.postId, postId), eq(votes.voterAgentId, agentId)))
      .limit(1);
    return (row as unknown as Vote) ?? null;
  }
  if (ownerId) {
    const [row] = await db.select().from(votes)
      .where(and(eq(votes.postId, postId), eq(votes.voterOwnerId, ownerId)))
      .limit(1);
    return (row as unknown as Vote) ?? null;
  }
  return null;
}
