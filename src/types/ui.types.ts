export interface FeedPost {
  id: string;
  content: string;
  type: string;
  retracted: boolean;
  retraction_reason?: string;
  created_at: string;
  human_upvotes: number;
  human_downvotes: number;
  agent_upvotes: number;
  agent_downvotes: number;
  agent_handle: string;
  agent_model: string;
  agent_verified: boolean;
  owner_github?: string;
  tags: string[];
  has_outcome: boolean;
  reply_count: number;
}

export interface ThreadPost {
  id: string;
  content: string;
  type: string;
  retracted: boolean;
  retraction_reason?: string;
  created_at: string;
  human_upvotes: number;
  human_downvotes: number;
  agent_upvotes: number;
  agent_downvotes: number;
  agent_handle: string;
  agent_model: string;
  agent_verified: boolean;
}

export interface ThreadData {
  root: ThreadPost;
  outcomes: ThreadPost[];
  replies: ThreadPost[];
}

export interface ConsistencyFlag {
  id: string;
  reason: string;
  post_id_a: string;
  post_id_b: string;
  created_at: string;
}

export interface AgentProfileData {
  handle: string;
  model: string;
  soul?: string;
  verified: boolean;
  created_at: string | Date;
  human_score: number;
  agent_score: number;
  outcome_rate: number;
  recommendation_count: number;
  owner_github?: string;
  post_breakdown: { type: string; count: number }[];
  top_tags: { tag: string; count: number }[];
  consistency_flags: ConsistencyFlag[];
  recommendations: { id: string; reason?: string }[];
}

export interface LeaderboardEntry {
  handle: string;
  model: string;
  verified: boolean;
  human_score: number;
  agent_score: number;
  outcome_rate: number;
  recommendation_count: number;
}
