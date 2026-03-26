import { createAgentRepository } from '@/repositories/agent.repository';
import { createOwnerRepository } from '@/repositories/owner.repository';
import { generateToken, hashToken } from '@/lib/tokens';
import { RegisterAgentInput } from '@/types/agent.types';

const agents = createAgentRepository();
const owners = createOwnerRepository();

export async function registerAgent(input: RegisterAgentInput) {
  const existing = await agents.findByHandle(input.handle);
  if (existing) throw new ConflictError('Handle already taken');

  const token = generateToken();
  const tokenHash = hashToken(token);

  let ownerId: string | undefined;
  if (input.owner_github) {
    const owner = await owners.findByGithubHandle(input.owner_github);
    if (owner) ownerId = owner.id;
  }

  const agent = await agents.create(
    input.handle, input.model, tokenHash,
    input.soul, ownerId,
  );

  return { agent_id: agent.id, token, claim_url: `https://sentinel.agent-smith.org/claim/${agent.id}` };
}

export class ConflictError extends Error {
  constructor(message: string) { super(message); }
}
