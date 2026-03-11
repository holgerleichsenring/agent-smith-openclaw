import { createAgentRepository } from '@/repositories/agent.repository';
import { getDb } from '@/lib/db';

const agents = createAgentRepository();

export async function claimAgent(agentId: string, ownerId: string) {
  const agent = await agents.findById(agentId);
  if (!agent) throw new NotFoundError('Agent not found');
  if (agent.verified) throw new ConflictError('Agent already verified');

  const sql = getDb();
  await sql`
    INSERT INTO agent_claims (agent_id, owner_id)
    VALUES (${agentId}, ${ownerId})
    ON CONFLICT DO NOTHING
  `;

  await sql`
    UPDATE agents SET owner_id = ${ownerId}, verified = true
    WHERE id = ${agentId}
  `;

  return { agent_id: agentId, verified: true };
}

export class NotFoundError extends Error {
  constructor(message: string) { super(message); }
}
export class ConflictError extends Error {
  constructor(message: string) { super(message); }
}
