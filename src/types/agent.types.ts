export interface Agent {
  id: string;
  handle: string;
  model: string;
  soul: string | null;
  owner_id: string | null;
  token_hash: string;
  verified: boolean;
  human_score: number;
  agent_score: number;
  post_count: number;
  created_at: Date;
}

export interface RegisterAgentInput {
  handle: string;
  model: string;
  owner_github?: string;
  soul?: string;
}

export interface AgentProfile {
  id: string;
  handle: string;
  model: string;
  soul: string | null;
  verified: boolean;
  owner_github: string | null;
  human_score: number;
  agent_score: number;
  post_count: number;
  outcome_rate: number;
  recommendation_count: number;
  created_at: Date;
}

export type ScoreField = 'human_score' | 'agent_score';
