import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildAgent, buildPost, buildAuditInput } from './fixtures';

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

const { createPost, ValidationError, ForbiddenError }
  = await import('@/services/post.service');

describe('createPost — outcome constraints', () => {
  const agent = buildAgent({ id: 'agent-1' });

  beforeEach(() => { vi.clearAllMocks(); });

  it('requires outcome_for for outcomes', async () => {
    const input = { content: 'Result was good.', type: 'outcome' as const };
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
  });

  it('rejects outcome for missing post', async () => {
    mockPostRepo.findById.mockResolvedValue(null);
    const input = { content: 'Result.', type: 'outcome' as const, outcome_for: 'missing' };
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
  });

  it('rejects outcome for other agent\'s decision', async () => {
    const decision = buildPost({ id: 'dec-1', agent_id: 'other', type: 'decision' });
    mockPostRepo.findById.mockResolvedValue(decision);
    const input = { content: 'Result.', type: 'outcome' as const, outcome_for: 'dec-1' };
    await expect(createPost(agent, input)).rejects.toThrow(ForbiddenError);
  });

  it('rejects outcome for non-decision post', async () => {
    const obs = buildPost({ id: 'obs-1', agent_id: 'agent-1', type: 'observation' });
    mockPostRepo.findById.mockResolvedValue(obs);
    const input = { content: 'Result.', type: 'outcome' as const, outcome_for: 'obs-1' };
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
  });
});

describe('createPost — audit constraints', () => {
  const agent = buildAgent({ id: 'agent-1' });
  const created = buildPost({ id: 'audit-post', agent_id: 'agent-1', type: 'audit' });

  beforeEach(() => { vi.clearAllMocks(); });

  it('rejects self-audit', async () => {
    const ownDecision = buildPost({ id: 'own-dec', agent_id: 'agent-1', type: 'decision' });
    mockPostRepo.findById.mockResolvedValue(ownDecision);
    const input = buildAuditInput({ outcome_for: 'own-dec' });
    await expect(createPost(agent, input)).rejects.toThrow(ForbiddenError);
  });

  it('allows audit of another agent\'s decision', async () => {
    const otherDecision = buildPost({ id: 'other-dec', agent_id: 'other', type: 'decision' });
    mockPostRepo.findById.mockResolvedValue(otherDecision);
    mockPostRepo.create.mockResolvedValue(created);
    const input = buildAuditInput({ outcome_for: 'other-dec' });

    const result = await createPost(agent, input);
    expect(result.id).toBe('audit-post');
  });

  it('rejects audit of non-decision post', async () => {
    const obs = buildPost({ id: 'obs-1', agent_id: 'other', type: 'observation' });
    mockPostRepo.findById.mockResolvedValue(obs);
    const input = buildAuditInput({ outcome_for: 'obs-1' });
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
  });

  it('normalizes decision_ref to outcome_for', async () => {
    const otherDecision = buildPost({ id: 'ref-dec', agent_id: 'other', type: 'decision' });
    mockPostRepo.findById.mockResolvedValue(otherDecision);
    mockPostRepo.create.mockResolvedValue(created);
    const input = {
      content: 'Held.', type: 'audit' as const,
      audit_status: 'holds', decision_ref: 'ref-dec',
    };

    await createPost(agent, input);
    expect(mockPostRepo.findById).toHaveBeenCalledWith('ref-dec');
  });

  it('normalizes lesson_learned to content', async () => {
    const otherDecision = buildPost({ id: 'ld-dec', agent_id: 'other', type: 'decision' });
    mockPostRepo.findById.mockResolvedValue(otherDecision);
    mockPostRepo.create.mockResolvedValue(created);
    const input = {
      content: '', type: 'audit' as const, audit_status: 'holds',
      outcome_for: 'ld-dec', lesson_learned: 'Decision held after 4 weeks.',
    };

    await createPost(agent, input);
    expect(mockPostRepo.create).toHaveBeenCalledWith(
      'agent-1', 'Decision held after 4 weeks.', 'audit',
      expect.anything(), undefined, 'ld-dec',
    );
  });

  it('normalizes status to audit_status', async () => {
    const otherDecision = buildPost({ id: 'st-dec', agent_id: 'other', type: 'decision' });
    mockPostRepo.findById.mockResolvedValue(otherDecision);
    mockPostRepo.create.mockResolvedValue(created);
    const input = {
      content: 'Held.', type: 'audit' as const,
      status: 'holds', outcome_for: 'st-dec',
    };

    await createPost(agent, input);
    expect(mockPostRepo.create).toHaveBeenCalledWith(
      'agent-1', 'Held.', 'audit',
      expect.objectContaining({ auditStatus: 'holds' }),
      undefined, 'st-dec',
    );
  });
});

describe('createPost — challenge/reply constraints', () => {
  const agent = buildAgent({ id: 'agent-1' });
  const target = buildPost({ id: 'target-1', agent_id: 'other' });
  const created = buildPost({ id: 'new', agent_id: 'agent-1' });

  beforeEach(() => { vi.clearAllMocks(); });

  it('requires thread_id for challenges', async () => {
    const input = {
      content: 'I disagree.', type: 'challenge' as const,
      reasoning: 'Seen in production.',
    };
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
  });

  it('requires thread_id for replies', async () => {
    const input = { content: 'Good point.', type: 'reply' as const };
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
  });

  it('rejects challenge with missing target', async () => {
    mockPostRepo.findById.mockResolvedValue(null);
    const input = {
      content: 'I disagree.', type: 'challenge' as const,
      thread_id: 'missing',
    };
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
  });

  it('allows valid challenge', async () => {
    mockPostRepo.findById.mockResolvedValue(target);
    mockPostRepo.create.mockResolvedValue(created);
    const input = {
      content: 'FAISS breaks at 10M vectors.', type: 'challenge' as const,
      thread_id: 'target-1',
    };

    const result = await createPost(agent, input);
    expect(result.id).toBe('new');
  });
});
