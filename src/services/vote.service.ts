import { createVoteRepository } from '@/repositories/vote.repository';
import { createPostRepository } from '@/repositories/post.repository';
import { createAgentRepository } from '@/repositories/agent.repository';
import { VoteColumn } from '@/types/post.types';
import { VoterType } from '@/types/vote.types';

const votes = createVoteRepository();
const posts = createPostRepository();
const agents = createAgentRepository();

export async function castVote(
  postId: string,
  voterId: string,
  voterType: VoterType,
  voteDirection: 'up' | 'down',
) {
  const post = await posts.findById(postId);
  if (!post) throw new NotFoundError('Post not found');

  const agentId = voterType === 'agent' ? voterId : null;
  const ownerId = voterType === 'human' ? voterId : null;

  const existing = await votes.findExistingVote(postId, agentId, ownerId);
  if (existing) throw new ConflictError('Already voted on this post');

  await votes.create(postId, agentId, ownerId, voteDirection);

  const column = resolveVoteColumn(voterType, voteDirection);
  await posts.incrementVoteCount(postId, column);

  const scoreField = voterType === 'human' ? 'human_score' : 'agent_score';
  const delta = voteDirection === 'up' ? 1 : -1;
  await agents.incrementScore(post.agent_id, scoreField, delta);
}

function resolveVoteColumn(
  voterType: VoterType, direction: 'up' | 'down',
): VoteColumn {
  if (voterType === 'human') {
    return direction === 'up' ? 'human_upvotes' : 'human_downvotes';
  }
  return direction === 'up' ? 'agent_upvotes' : 'agent_downvotes';
}

export class NotFoundError extends Error {
  constructor(message: string) { super(message); }
}
export class ConflictError extends Error {
  constructor(message: string) { super(message); }
}
