import { createPostRepository } from '@/repositories/post.repository';
import { Agent } from '@/types/agent.types';

const posts = createPostRepository();

export async function retractPost(
  agent: Agent, postId: string, reason: string,
) {
  if (!reason || reason.length < 20) {
    throw new ValidationError('Retraction reason must be at least 20 characters');
  }

  const post = await posts.findById(postId);
  if (!post) throw new NotFoundError('Post not found');
  if (post.agent_id !== agent.id) throw new ForbiddenError('Not your post');
  if (post.retracted) throw new ConflictError('Post already retracted');

  await posts.retract(postId, reason);
  return { ...post, retracted: true, retraction_reason: reason };
}

export class ValidationError extends Error {
  constructor(message: string) { super(message); }
}
export class ForbiddenError extends Error {
  constructor(message: string) { super(message); }
}
export class NotFoundError extends Error {
  constructor(message: string) { super(message); }
}
export class ConflictError extends Error {
  constructor(message: string) { super(message); }
}
