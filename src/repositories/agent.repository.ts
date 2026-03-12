import { eq, sql, InferSelectModel } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { agents } from '@/db/schema';
import { Agent, ScoreField } from '@/types/agent.types';

type AgentRow = InferSelectModel<typeof agents>;

function toAgent(row: AgentRow): Agent {
  return {
    id: row.id, handle: row.handle, model: row.model,
    soul: row.soul, owner_id: row.ownerId, token_hash: row.tokenHash,
    verified: row.verified ?? false,
    human_score: Number(row.humanScore) || 0,
    agent_score: Number(row.agentScore) || 0,
    post_count: row.postCount ?? 0, created_at: row.createdAt!,
  };
}

export interface AgentRepository {
  create(handle: string, model: string, tokenHash: string, soul?: string, ownerId?: string): Promise<Agent>;
  findById(id: string): Promise<Agent | null>;
  findByHandle(handle: string): Promise<Agent | null>;
  findByTokenHash(hash: string): Promise<Agent | null>;
  setVerified(id: string): Promise<void>;
  incrementScore(id: string, field: ScoreField, delta: number): Promise<void>;
  incrementPostCount(id: string): Promise<void>;
}

export function createAgentRepository(): AgentRepository {
  return {
    create, findById, findByHandle,
    findByTokenHash, setVerified,
    incrementScore, incrementPostCount,
  };
}

async function create(
  handle: string, model: string, tokenHash: string,
  soul?: string, ownerId?: string,
): Promise<Agent> {
  const db = getDb();
  const [row] = await db.insert(agents).values({
    handle, model, tokenHash,
    soul: soul ?? null,
    ownerId: ownerId ?? null,
  }).returning();
  return toAgent(row);
}

async function findById(id: string): Promise<Agent | null> {
  const db = getDb();
  const [row] = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return row ? toAgent(row) : null;
}

async function findByHandle(handle: string): Promise<Agent | null> {
  const db = getDb();
  const [row] = await db.select().from(agents)
    .where(eq(agents.handle, handle)).limit(1);
  return row ? toAgent(row) : null;
}

async function findByTokenHash(hash: string): Promise<Agent | null> {
  const db = getDb();
  const [row] = await db.select().from(agents)
    .where(eq(agents.tokenHash, hash)).limit(1);
  return row ? toAgent(row) : null;
}

async function setVerified(id: string): Promise<void> {
  const db = getDb();
  await db.update(agents).set({ verified: true }).where(eq(agents.id, id));
}

async function incrementScore(
  id: string, field: ScoreField, delta: number,
): Promise<void> {
  const db = getDb();
  const col = field === 'human_score' ? agents.humanScore : agents.agentScore;
  const key = field === 'human_score' ? 'humanScore' : 'agentScore';
  await db.update(agents)
    .set({ [key]: sql`${col} + ${delta}` })
    .where(eq(agents.id, id));
}

async function incrementPostCount(id: string): Promise<void> {
  const db = getDb();
  await db.update(agents)
    .set({ postCount: sql`${agents.postCount} + 1` })
    .where(eq(agents.id, id));
}
