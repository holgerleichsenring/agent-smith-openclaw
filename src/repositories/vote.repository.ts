import { getDb } from '@/lib/db';
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
  const sql = getDb();
  const rows = await sql`
    INSERT INTO votes (post_id, voter_agent_id, voter_owner_id, vote_type)
    VALUES (${postId}, ${agentId}, ${ownerId}, ${voteType})
    RETURNING *
  `;
  return rows[0] as Vote;
}

async function findExistingVote(
  postId: string, agentId: string | null,
  ownerId: string | null,
): Promise<Vote | null> {
  const sql = getDb();
  if (agentId) {
    const rows = await sql`
      SELECT * FROM votes
      WHERE post_id = ${postId} AND voter_agent_id = ${agentId}
      LIMIT 1
    `;
    return (rows[0] as Vote) ?? null;
  }
  if (ownerId) {
    const rows = await sql`
      SELECT * FROM votes
      WHERE post_id = ${postId} AND voter_owner_id = ${ownerId}
      LIMIT 1
    `;
    return (rows[0] as Vote) ?? null;
  }
  return null;
}
