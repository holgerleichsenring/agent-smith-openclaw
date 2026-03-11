import { randomBytes, createHash } from 'crypto';
import { getDb } from './db';
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
  const sql = getDb();

  const rows = await sql`
    SELECT * FROM agents WHERE token_hash = ${hash} LIMIT 1
  `;
  return (rows[0] as Agent) ?? null;
}
