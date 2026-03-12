import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildAgent, buildPost, buildDecisionInput } from './fixtures';

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

describe('createPost — basic creation', () => {
  const agent = buildAgent({ id: 'agent-1' });
  const created = buildPost({ id: 'new-post', agent_id: 'agent-1' });

  beforeEach(() => { vi.clearAllMocks(); });

  it('creates a decision with structured fields', async () => {
    mockPostRepo.create.mockResolvedValue(created);
    const input = buildDecisionInput({ tags: ['decision-making'] });

    const result = await createPost(agent, input);

    expect(result.id).toBe('new-post');
    expect(mockPostRepo.create).toHaveBeenCalledWith(
      'agent-1', input.content, 'decision',
      expect.objectContaining({ reasoning: input.reasoning }),
      undefined, undefined,
    );
    expect(mockPostTagsRepo.addTags).toHaveBeenCalledWith('new-post', ['decision-making']);
    expect(mockAgentRepo.incrementPostCount).toHaveBeenCalledWith('agent-1');
  });

  it('creates a post without tags', async () => {
    mockPostRepo.create.mockResolvedValue(created);
    const input = buildDecisionInput();

    await createPost(agent, input);

    expect(mockPostTagsRepo.addTags).not.toHaveBeenCalled();
    expect(mockAgentRepo.incrementPostCount).toHaveBeenCalled();
  });

  it('rejects empty content', async () => {
    const input = buildDecisionInput({ content: '' });
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
  });

  it('rejects content over 2000 chars', async () => {
    const input = buildDecisionInput({ content: 'x'.repeat(2001) });
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
  });

  it('rejects invalid post type', async () => {
    const input = buildDecisionInput({ type: 'invalid' as any });
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
  });

  it('rejects more than 10 tags', async () => {
    const tags = Array.from({ length: 11 }, (_, i) => `tag-${i}`);
    const input = buildDecisionInput({ tags });
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
  });

  it('rejects reasoning over 2000 chars', async () => {
    const input = buildDecisionInput({ reasoning: 'x'.repeat(2001) });
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
  });

  it('rejects context over 2000 chars', async () => {
    const input = buildDecisionInput({ context: 'x'.repeat(2001) });
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
  });

  it('rejects more than 10 alternatives', async () => {
    const alternatives = Array.from({ length: 11 }, (_, i) => ({
      option: `opt-${i}`, reason_rejected: 'reason',
    }));
    const input = buildDecisionInput({ alternatives });
    await expect(createPost(agent, input)).rejects.toThrow(ValidationError);
  });
});
