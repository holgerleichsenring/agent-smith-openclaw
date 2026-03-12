import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildAgent, buildDecisionInput } from './fixtures';

const mockPostRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findByAgentId: vi.fn(),
  findByThreadId: vi.fn(),
  findOutcomesFor: vi.fn(),
  retract: vi.fn(),
  incrementVoteCount: vi.fn(),
};
const mockPostTagsRepo = {
  addTags: vi.fn(),
  findByPostId: vi.fn(),
  findByTag: vi.fn(),
};
const mockAgentRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findByHandle: vi.fn(),
  findByTokenHash: vi.fn(),
  setVerified: vi.fn(),
  incrementScore: vi.fn(),
  incrementPostCount: vi.fn(),
};

vi.mock('@/repositories/post.repository', () => ({
  createPostRepository: () => mockPostRepo,
}));
vi.mock('@/repositories/post-tags.repository', () => ({
  createPostTagsRepository: () => mockPostTagsRepo,
}));
vi.mock('@/repositories/agent.repository', () => ({
  createAgentRepository: () => mockAgentRepo,
}));

const { createPost, ValidationError }
  = await import('@/services/post.service');

describe('createPost — decision validation', () => {
  const agent = buildAgent({ id: 'agent-1' });

  beforeEach(() => { vi.clearAllMocks(); });

  it('requires reasoning for decisions', async () => {
    const input = buildDecisionInput({ reasoning: '' });
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
    await expect(createPost(agent, input)).rejects.toThrow(/reasoning/i);
  });

  it('requires confidence for decisions', async () => {
    const input = buildDecisionInput({ confidence: undefined });
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
    await expect(createPost(agent, input)).rejects.toThrow(/confidence/i);
  });

  it('requires context for decisions', async () => {
    const input = buildDecisionInput({ context: '' });
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
    await expect(createPost(agent, input)).rejects.toThrow(/context/i);
  });

  it('rejects invalid confidence level', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const input = buildDecisionInput({ confidence: 'very-high' as any });
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
    await expect(createPost(agent, input)).rejects.toThrow(/confidence/i);
  });

  it('rejects alternatives with missing option', async () => {
    const input = buildDecisionInput({
      alternatives: [{ option: '', reason_rejected: 'reason' }],
    });
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
  });

  it('rejects alternatives with missing reason_rejected', async () => {
    const input = buildDecisionInput({
      alternatives: [{ option: 'Pinecone', reason_rejected: '' }],
    });
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
  });
});

describe('createPost — audit validation', () => {
  const agent = buildAgent({ id: 'agent-1' });

  beforeEach(() => { vi.clearAllMocks(); });

  it('requires audit_status for audits', async () => {
    const input = {
      content: 'Decision held.', type: 'audit' as const,
      outcome_for: 'some-post',
    };
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
    await expect(createPost(agent, input)).rejects.toThrow(/status/i);
  });

  it('rejects invalid audit_status', async () => {
    const input = {
      content: 'Decision held.', type: 'audit' as const,
      audit_status: 'maybe', outcome_for: 'some-post',
    };
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
  });

  it('rejects lesson_learned over 500 chars', async () => {
    const input = {
      content: 'x'.repeat(501), type: 'audit' as const,
      audit_status: 'holds', outcome_for: 'some-post',
    };
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
  });
});
