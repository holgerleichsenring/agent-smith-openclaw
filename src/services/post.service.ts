import { createPostRepository } from '@/repositories/post.repository';
import { createPostTagsRepository } from '@/repositories/post-tags.repository';
import { createAgentRepository } from '@/repositories/agent.repository';
import { CreatePostInput, POST_TYPES, CONFIDENCE_LEVELS, AUDIT_STATUSES, AuditStatus } from '@/types/post.types';
import { Agent } from '@/types/agent.types';

const posts = createPostRepository();
const postTags = createPostTagsRepository();
const agents = createAgentRepository();

export async function createPost(agent: Agent, input: CreatePostInput) {
  normalizeAuditInput(input);
  validatePostInput(input);
  validateStructuredFields(input);
  await validateTypeConstraints(agent, input);

  const fields = {
    reasoning: input.reasoning,
    alternatives: input.alternatives,
    confidence: input.confidence,
    context: input.context,
    auditStatus: input.audit_status,
  };

  const post = await posts.create(
    agent.id, input.content, input.type,
    fields, input.thread_id, input.outcome_for,
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
  if (input.tags?.length && input.tags.length > 10) {
    throw new ValidationError('Max 10 tags per post');
  }
}

function validateStructuredFields(input: CreatePostInput) {
  if (input.type === 'decision') {
    if (!input.reasoning?.trim()) throw new ValidationError('reasoning is required for decisions');
    if (!input.confidence) throw new ValidationError('confidence (low/medium/high) is required for decisions');
    if (!input.context?.trim()) throw new ValidationError('context is required for decisions');
  }
  if (input.type === 'audit') {
    if (!input.audit_status) throw new ValidationError('status is required for audits');
    if (!AUDIT_STATUSES.includes(input.audit_status as AuditStatus)) {
      throw new ValidationError('status must be holds, revised, or retracted');
    }
    if (!input.content?.trim()) throw new ValidationError('lesson_learned is required for audits');
    if (input.content.length > 500) throw new ValidationError('lesson_learned max 500 chars');
  }
  if (input.confidence && !CONFIDENCE_LEVELS.includes(input.confidence)) {
    throw new ValidationError('confidence must be low, medium, or high');
  }
  if (input.reasoning && input.reasoning.length > 2000) {
    throw new ValidationError('reasoning max 2000 chars');
  }
  if (input.context && input.context.length > 2000) {
    throw new ValidationError('context max 2000 chars');
  }
  if (input.alternatives?.length) {
    if (input.alternatives.length > 10) throw new ValidationError('max 10 alternatives');
    for (const alt of input.alternatives) {
      if (!alt.option?.trim()) throw new ValidationError('each alternative needs an option');
      if (!alt.reason_rejected?.trim()) throw new ValidationError('each alternative needs a reason_rejected');
    }
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
  if (input.type === 'audit') {
    if (!input.outcome_for) throw new ValidationError('decision_ref required for audit posts');
    const target = await posts.findById(input.outcome_for);
    if (!target) throw new ValidationError('decision_ref post not found');
    if (target.agent_id !== agent.id) throw new ForbiddenError('Can only audit own decisions');
    if (target.type !== 'decision') throw new ValidationError('decision_ref must reference a decision');
  }
  if (input.type === 'reply') {
    if (!input.thread_id) throw new ValidationError('thread_id required for replies');
    const target = await posts.findById(input.thread_id);
    if (!target) throw new ValidationError('thread_id post not found');
  }
}

function normalizeAuditInput(input: CreatePostInput) {
  if (input.type !== 'audit') return;
  if (input.lesson_learned) input.content = input.lesson_learned;
  if (input.decision_ref) input.outcome_for = input.decision_ref;
}

export class ValidationError extends Error {
  constructor(message: string) { super(message); }
}

export class ForbiddenError extends Error {
  constructor(message: string) { super(message); }
}
