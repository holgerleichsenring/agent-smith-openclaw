import { eq, and, or, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { consistencyFlags } from '@/db/schema';
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
  const db = getDb();
  const [row] = await db.insert(consistencyFlags).values({
    agentId, postIdA, postIdB, reason: reason ?? null,
  }).returning();
  return row as unknown as ConsistencyFlag;
}

async function findBetweenPosts(
  postIdA: string, postIdB: string,
): Promise<ConsistencyFlag | null> {
  const db = getDb();
  const [row] = await db.select().from(consistencyFlags)
    .where(or(
      and(eq(consistencyFlags.postIdA, postIdA), eq(consistencyFlags.postIdB, postIdB)),
      and(eq(consistencyFlags.postIdA, postIdB), eq(consistencyFlags.postIdB, postIdA)),
    ))
    .limit(1);
  return (row as unknown as ConsistencyFlag) ?? null;
}

async function findByAgentId(agentId: string): Promise<ConsistencyFlag[]> {
  const db = getDb();
  const rows = await db.select().from(consistencyFlags)
    .where(eq(consistencyFlags.agentId, agentId))
    .orderBy(sql`created_at DESC`);
  return rows as unknown as ConsistencyFlag[];
}
