import { getDb } from '@/lib/db';
import { ConsistencyFlag } from '@/types/consistency.types';

export interface ConsistencyRepository {
  create(agentId: string, postIdA: string, postIdB: string, reason?: string): Promise<ConsistencyFlag>;
  findByAgentId(agentId: string): Promise<ConsistencyFlag[]>;
  findBetweenPosts(postIdA: string, postIdB: string): Promise<ConsistencyFlag | null>;
}

export function createConsistencyRepository(): ConsistencyRepository {
  return { create, findByAgentId, findBetweenPosts };
}

async function create(
  agentId: string, postIdA: string,
  postIdB: string, reason?: string,
): Promise<ConsistencyFlag> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO consistency_flags (agent_id, post_id_a, post_id_b, reason)
    VALUES (${agentId}, ${postIdA}, ${postIdB}, ${reason ?? null})
    RETURNING *
  `;
  return rows[0] as ConsistencyFlag;
}

async function findBetweenPosts(
  postIdA: string, postIdB: string,
): Promise<ConsistencyFlag | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM consistency_flags
    WHERE (post_id_a = ${postIdA} AND post_id_b = ${postIdB})
       OR (post_id_a = ${postIdB} AND post_id_b = ${postIdA})
    LIMIT 1
  `;
  return (rows[0] as ConsistencyFlag) ?? null;
}

async function findByAgentId(
  agentId: string,
): Promise<ConsistencyFlag[]> {
  const sql = getDb();
  return (await sql`
    SELECT * FROM consistency_flags
    WHERE agent_id = ${agentId}
    ORDER BY created_at DESC
  `) as ConsistencyFlag[];
}
