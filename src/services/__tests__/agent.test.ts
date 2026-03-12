import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildAgent } from './fixtures';

const mockAgentRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findByHandle: vi.fn(),
  findByTokenHash: vi.fn(),
  setVerified: vi.fn(),
  incrementScore: vi.fn(),
  incrementPostCount: vi.fn(),
};
const mockOwnerRepo = {
  findById: vi.fn(),
  findByGithubHandle: vi.fn(),
  create: vi.fn(),
};

vi.mock('@/repositories/agent.repository', () => ({
  createAgentRepository: () => mockAgentRepo,
}));
vi.mock('@/repositories/owner.repository', () => ({
  createOwnerRepository: () => mockOwnerRepo,
}));
vi.mock('@/lib/tokens', () => ({
  generateToken: () => 'test-token-abc',
  hashToken: () => 'hashed-test-token',
}));

const { registerAgent, ConflictError }
  = await import('@/services/agent.service');

describe('registerAgent', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('registers a new agent and returns token', async () => {
    const created = buildAgent({ id: 'new-agent' });
    mockAgentRepo.findByHandle.mockResolvedValue(null);
    mockAgentRepo.create.mockResolvedValue(created);

    const result = await registerAgent({
      handle: 'pragmatist', model: 'claude-opus-4-6',
    });

    expect(result.agent_id).toBe('new-agent');
    expect(result.token).toBe('test-token-abc');
    expect(result.claim_url).toContain('new-agent');
    expect(mockAgentRepo.create).toHaveBeenCalledWith(
      'pragmatist', 'claude-opus-4-6', 'hashed-test-token',
      undefined, undefined,
    );
  });

  it('throws ConflictError for duplicate handle', async () => {
    mockAgentRepo.findByHandle.mockResolvedValue(buildAgent());

    await expect(registerAgent({
      handle: 'taken', model: 'claude-opus-4-6',
    })).rejects.toThrow(ConflictError);
  });

  it('links owner when owner_github matches', async () => {
    const created = buildAgent({ id: 'linked-agent' });
    mockAgentRepo.findByHandle.mockResolvedValue(null);
    mockOwnerRepo.findByGithubHandle.mockResolvedValue({ id: 'owner-1' });
    mockAgentRepo.create.mockResolvedValue(created);

    await registerAgent({
      handle: 'myagent', model: 'gpt-4', owner_github: 'octocat',
    });

    expect(mockOwnerRepo.findByGithubHandle).toHaveBeenCalledWith('octocat');
    expect(mockAgentRepo.create).toHaveBeenCalledWith(
      'myagent', 'gpt-4', 'hashed-test-token',
      undefined, 'owner-1',
    );
  });

  it('registers without owner when github handle not found', async () => {
    const created = buildAgent({ id: 'no-owner' });
    mockAgentRepo.findByHandle.mockResolvedValue(null);
    mockOwnerRepo.findByGithubHandle.mockResolvedValue(null);
    mockAgentRepo.create.mockResolvedValue(created);

    await registerAgent({
      handle: 'lonely', model: 'gpt-4', owner_github: 'nobody',
    });

    expect(mockAgentRepo.create).toHaveBeenCalledWith(
      'lonely', 'gpt-4', 'hashed-test-token',
      undefined, undefined,
    );
  });
});
