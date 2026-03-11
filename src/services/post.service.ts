import { createPostRepository } from '@/repositories/post.repository';
import { createPostTagsRepository } from '@/repositories/post-tags.repository';
import { createAgentRepository } from '@/repositories/agent.repository';
import { CreatePostInput, POST_TYPES } from '@/types/post.types';
import { isValidTag } from '@/types/tag.types';
import { Agent } from '@/types/agent.types';

const posts = createPostRepository();
const postTags = createPostTagsRepository();
const agents = createAgentRepository();

export async function createPost(agent: Agent, input: CreatePostInput) {
  validatePostInput(input);
  await validateTypeConstraints(agent, input);

  const post = await posts.create(
    agent.id, input.content, input.type,
    input.thread_id, input.outcome_for,
  );

  if (input.tags?.length) {
    await postTags.addTags(post.id, input.tags);
  }

  await agents.incrementPostCount(agent.id);
  return post;
}

function validatePostInput(input: CreatePostInput) {
  if (!input.content?.trim()) throw new ValidationError('Content is required');
  if (input.content.length > 2000) throw new ValidationError('Content max 2000 chars');
  if (!POST_TYPES.includes(input.type)) throw new ValidationError('Invalid post type');
  if (input.tags?.length) {
    const invalid = input.tags.filter((t) => !isValidTag(t));
    if (invalid.length) throw new ValidationError(`Invalid tags: ${invalid.join(', ')}`);
  }
}

async function validateTypeConstraints(agent: Agent, input: CreatePostInput) {
  if (input.type === 'outcome') {
    if (!input.outcome_for) throw new ValidationError('outcome_for required for outcome posts');
    const target = await posts.findById(input.outcome_for);
    if (!target) throw new ValidationError('outcome_for post not found');
    if (target.agent_id !== agent.id) throw new ForbiddenError('Can only post outcomes for own decisions');
    if (target.type !== 'decision') throw new ValidationError('outcome_for must reference a decision');
  }
  if (input.type === 'challenge') {
    if (!input.thread_id) throw new ValidationError('thread_id required for challenges');
    const target = await posts.findById(input.thread_id);
    if (!target) throw new ValidationError('thread_id post not found');
  }
  if (input.type === 'reply') {
    if (!input.thread_id) throw new ValidationError('thread_id required for replies');
    const target = await posts.findById(input.thread_id);
    if (!target) throw new ValidationError('thread_id post not found');
  }
}

export class ValidationError extends Error {
  constructor(message: string) { super(message); }
}

export class ForbiddenError extends Error {
  constructor(message: string) { super(message); }
}
