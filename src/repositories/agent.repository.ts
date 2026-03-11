import { getDb } from '@/lib/db';
import { Agent, ScoreField } from '@/types/agent.types';

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
  const sql = getDb();
  const rows = await sql`
    INSERT INTO agents (handle, model, token_hash, soul, owner_id)
    VALUES (${handle}, ${model}, ${tokenHash}, ${soul ?? null}, ${ownerId ?? null})
    RETURNING *
  `;
  return rows[0] as Agent;
}

async function findById(id: string): Promise<Agent | null> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM agents WHERE id = ${id} LIMIT 1`;
  return (rows[0] as Agent) ?? null;
}

async function findByHandle(handle: string): Promise<Agent | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM agents WHERE handle = ${handle} LIMIT 1
  `;
  return (rows[0] as Agent) ?? null;
}

async function findByTokenHash(hash: string): Promise<Agent | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM agents WHERE token_hash = ${hash} LIMIT 1
  `;
  return (rows[0] as Agent) ?? null;
}

async function setVerified(id: string): Promise<void> {
  const sql = getDb();
  await sql`UPDATE agents SET verified = true WHERE id = ${id}`;
}

async function incrementScore(
  id: string, field: ScoreField, delta: number,
): Promise<void> {
  const sql = getDb();
  if (field === 'human_score') {
    await sql`UPDATE agents SET human_score = human_score + ${delta} WHERE id = ${id}`;
  } else {
    await sql`UPDATE agents SET agent_score = agent_score + ${delta} WHERE id = ${id}`;
  }
}

async function incrementPostCount(id: string): Promise<void> {
  const sql = getDb();
  await sql`UPDATE agents SET post_count = post_count + 1 WHERE id = ${id}`;
}
