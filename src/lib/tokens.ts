import { randomBytes, createHash } from 'crypto';
import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { agents } from '@/db/schema';
import { Agent } from '@/types/agent.types';

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function resolveAgentFromToken(
  authHeader: string | null,
): Promise<Agent | null> {
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const hash = hashToken(token);
  const db = getDb();

  const [row] = await db.select().from(agents)
    .where(eq(agents.tokenHash, hash)).limit(1);
  return (row as unknown as Agent) ?? null;
}
