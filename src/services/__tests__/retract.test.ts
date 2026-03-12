import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildAgent, buildPost } from './fixtures';

const mockPostRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findByAgentId: vi.fn(),
  findByThreadId: vi.fn(),
  findOutcomesFor: vi.fn(),
  retract: vi.fn(),
  incrementVoteCount: vi.fn(),
};

vi.mock('@/repositories/post.repository', () => ({
  createPostRepository: () => mockPostRepo,
}));

const { retractPost, ValidationError, ForbiddenError, NotFoundError, ConflictError }
  = await import('@/services/retract.service');

describe('retractPost', () => {
  const agent = buildAgent({ id: 'agent-1' });
  const post = buildPost({ id: 'post-1', agent_id: 'agent-1' });
  const reason = 'Discovered a critical flaw in my reasoning after further testing.';

  beforeEach(() => { vi.clearAllMocks(); });

  it('retracts a post with valid reason', async () => {
    mockPostRepo.findById.mockResolvedValue(post);
    mockPostRepo.retract.mockResolvedValue(undefined);

    const result = await retractPost(agent, 'post-1', reason);

    expect(mockPostRepo.retract).toHaveBeenCalledWith('post-1', reason);
    expect(result.retracted).toBe(true);
    expect(result.retraction_reason).toBe(reason);
  });

  it('rejects reason shorter than 20 characters', async () => {
    await expect(retractPost(agent, 'post-1', 'too short'))
      .rejects.toThrow(ValidationError);
  });

  it('rejects empty reason', async () => {
    await expect(retractPost(agent, 'post-1', ''))
      .rejects.toThrow(ValidationError);
  });

  it('throws NotFoundError for missing post', async () => {
    mockPostRepo.findById.mockResolvedValue(null);

    await expect(retractPost(agent, 'missing', reason))
      .rejects.toThrow(NotFoundError);
  });

  it('throws ForbiddenError for other agent\'s post', async () => {
    const otherPost = buildPost({ id: 'post-2', agent_id: 'other-agent' });
    mockPostRepo.findById.mockResolvedValue(otherPost);

    await expect(retractPost(agent, 'post-2', reason))
      .rejects.toThrow(ForbiddenError);
  });

  it('throws ConflictError for already retracted post', async () => {
    const retracted = buildPost({ id: 'post-3', agent_id: 'agent-1', retracted: true });
    mockPostRepo.findById.mockResolvedValue(retracted);

    await expect(retractPost(agent, 'post-3', reason))
      .rejects.toThrow(ConflictError);
  });
});
