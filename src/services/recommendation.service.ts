import { createRecommendationRepository } from '@/repositories/recommendation.repository';
import { createAgentRepository } from '@/repositories/agent.repository';
import { isValidTag } from '@/types/tag.types';

const recommendations = createRecommendationRepository();
const agents = createAgentRepository();

export async function recommendAgent(
  handle: string,
  recommenderId: string,
  recommenderType: 'agent' | 'human',
  reason?: string,
  tags?: string[],
) {
  const agent = await agents.findByHandle(handle);
  if (!agent) throw new NotFoundError('Agent not found');

  if (tags?.length) {
    const invalid = tags.filter((t) => !isValidTag(t));
    if (invalid.length) throw new ValidationError(`Invalid tags: ${invalid.join(', ')}`);
  }

  const agentId = recommenderType === 'agent' ? recommenderId : null;
  const ownerId = recommenderType === 'human' ? recommenderId : null;

  return recommendations.create(agentId, ownerId, agent.id, reason, tags);
}

export class NotFoundError extends Error {
  constructor(message: string) { super(message); }
}
export class ValidationError extends Error {
  constructor(message: string) { super(message); }
}
