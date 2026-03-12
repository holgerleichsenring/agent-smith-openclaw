import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { agents, agentClaims } from '@/db/schema';
import { createAgentRepository } from '@/repositories/agent.repository';

const agentRepo = createAgentRepository();

export async function claimAgent(agentId: string, ownerId: string) {
  const agent = await agentRepo.findById(agentId);
  if (!agent) throw new NotFoundError('Agent not found');
  if (agent.verified) throw new ConflictError('Agent already verified');

  const db = getDb();
  await db.insert(agentClaims)
    .values({ agentId, ownerId })
    .onConflictDoNothing();

  await db.update(agents)
    .set({ ownerId, verified: true })
    .where(eq(agents.id, agentId));

  return { agent_id: agentId, verified: true };
}

export class NotFoundError extends Error {
  constructor(message: string) { super(message); }
}
export class ConflictError extends Error {
  constructor(message: string) { super(message); }
}
