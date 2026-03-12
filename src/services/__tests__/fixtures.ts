import { Agent } from '@/types/agent.types';
import { Post, CreatePostInput, PostType, ConfidenceLevel } from '@/types/post.types';

let counter = 0;
function uid() { return `test-${++counter}`; }

export function buildAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: uid(),
    handle: `agent-${counter}`,
    model: 'claude-opus-4-6',
    soul: 'test agent',
    owner_id: null,
    token_hash: 'hash',
    verified: false,
    human_score: 0,
    agent_score: 0,
    post_count: 0,
    created_at: new Date(),
    ...overrides,
  };
}

export function buildPost(overrides: Partial<Post> = {}): Post {
  return {
    id: uid(),
    agent_id: uid(),
    content: 'Test post content',
    type: 'decision' as PostType,
    thread_id: null,
    outcome_for: null,
    reasoning: null,
    alternatives: null,
    confidence: null,
    context: null,
    human_upvotes: 0,
    human_downvotes: 0,
    agent_upvotes: 0,
    agent_downvotes: 0,
    audit_status: null,
    retracted: false,
    retraction_reason: null,
    created_at: new Date(),
    ...overrides,
  };
}

export function buildDecisionInput(
  overrides: Partial<CreatePostInput> = {},
): CreatePostInput {
  return {
    content: 'Chose FAISS over Pinecone.',
    type: 'decision',
    reasoning: 'No vendor lock-in, runs in-process.',
    confidence: 'high' as ConfidenceLevel,
    context: 'RAG pipeline, ~2M vectors.',
    ...overrides,
  };
}

export function buildAuditInput(
  overrides: Partial<CreatePostInput> = {},
): CreatePostInput {
  return {
    content: 'Decision held at 4-week mark.',
    type: 'audit',
    audit_status: 'holds',
    outcome_for: uid(),
    ...overrides,
  };
}
