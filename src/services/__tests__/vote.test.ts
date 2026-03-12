import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildPost } from './fixtures';

const mockVoteRepo = {
  create: vi.fn(),
  findExistingVote: vi.fn(),
};
const mockPostRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findByAgentId: vi.fn(),
  findByThreadId: vi.fn(),
  findOutcomesFor: vi.fn(),
  retract: vi.fn(),
  incrementVoteCount: vi.fn(),
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

vi.mock('@/repositories/vote.repository', () => ({
  createVoteRepository: () => mockVoteRepo,
}));
vi.mock('@/repositories/post.repository', () => ({
  createPostRepository: () => mockPostRepo,
}));
vi.mock('@/repositories/agent.repository', () => ({
  createAgentRepository: () => mockAgentRepo,
}));

const { castVote, NotFoundError, ConflictError }
  = await import('@/services/vote.service');

describe('castVote', () => {
  const post = buildPost({ id: 'post-1', agent_id: 'author-1' });

  beforeEach(() => { vi.clearAllMocks(); });

  it('casts an agent upvote', async () => {
    mockPostRepo.findById.mockResolvedValue(post);
    mockVoteRepo.findExistingVote.mockResolvedValue(null);
    mockVoteRepo.create.mockResolvedValue({});

    await castVote('post-1', 'voter-1', 'agent', 'up');

    expect(mockVoteRepo.create).toHaveBeenCalledWith('post-1', 'voter-1', null, 'up');
    expect(mockPostRepo.incrementVoteCount).toHaveBeenCalledWith('post-1', 'agent_upvotes');
    expect(mockAgentRepo.incrementScore).toHaveBeenCalledWith('author-1', 'agent_score', 1);
  });

  it('casts a human downvote', async () => {
    mockPostRepo.findById.mockResolvedValue(post);
    mockVoteRepo.findExistingVote.mockResolvedValue(null);
    mockVoteRepo.create.mockResolvedValue({});

    await castVote('post-1', 'owner-1', 'human', 'down');

    expect(mockVoteRepo.create).toHaveBeenCalledWith('post-1', null, 'owner-1', 'down');
    expect(mockPostRepo.incrementVoteCount).toHaveBeenCalledWith('post-1', 'human_downvotes');
    expect(mockAgentRepo.incrementScore).toHaveBeenCalledWith('author-1', 'human_score', -1);
  });

  it('throws NotFoundError for missing post', async () => {
    mockPostRepo.findById.mockResolvedValue(null);

    await expect(castVote('missing', 'voter-1', 'agent', 'up'))
      .rejects.toThrow(NotFoundError);
  });

  it('throws ConflictError for duplicate vote', async () => {
    mockPostRepo.findById.mockResolvedValue(post);
    mockVoteRepo.findExistingVote.mockResolvedValue({ id: 'existing' });

    await expect(castVote('post-1', 'voter-1', 'agent', 'up'))
      .rejects.toThrow(ConflictError);
  });

  it('increments correct counter for agent downvote', async () => {
    mockPostRepo.findById.mockResolvedValue(post);
    mockVoteRepo.findExistingVote.mockResolvedValue(null);
    mockVoteRepo.create.mockResolvedValue({});

    await castVote('post-1', 'voter-1', 'agent', 'down');

    expect(mockPostRepo.incrementVoteCount).toHaveBeenCalledWith('post-1', 'agent_downvotes');
    expect(mockAgentRepo.incrementScore).toHaveBeenCalledWith('author-1', 'agent_score', -1);
  });

  it('increments correct counter for human upvote', async () => {
    mockPostRepo.findById.mockResolvedValue(post);
    mockVoteRepo.findExistingVote.mockResolvedValue(null);
    mockVoteRepo.create.mockResolvedValue({});

    await castVote('post-1', 'owner-1', 'human', 'up');

    expect(mockPostRepo.incrementVoteCount).toHaveBeenCalledWith('post-1', 'human_upvotes');
    expect(mockAgentRepo.incrementScore).toHaveBeenCalledWith('author-1', 'human_score', 1);
  });
});
