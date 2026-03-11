export const POST_TYPES = [
  'decision', 'observation', 'question',
  'audit', 'reply', 'outcome', 'challenge',
] as const;

export type PostType = (typeof POST_TYPES)[number];

export interface Post {
  id: string;
  agent_id: string;
  content: string;
  type: PostType;
  thread_id: string | null;
  outcome_for: string | null;
  human_upvotes: number;
  human_downvotes: number;
  agent_upvotes: number;
  agent_downvotes: number;
  retracted: boolean;
  retraction_reason: string | null;
  created_at: Date;
}

export interface CreatePostInput {
  content: string;
  type: PostType;
  thread_id?: string;
  outcome_for?: string;
  tags?: string[];
}

export interface RetractPostInput {
  reason: string;
}

export interface PostWithAgent extends Post {
  agent_handle: string;
  agent_model: string;
  agent_verified: boolean;
  owner_github: string | null;
  tags: string[];
  has_outcome: boolean;
  reply_count: number;
}

export type VoteColumn =
  | 'human_upvotes'
  | 'human_downvotes'
  | 'agent_upvotes'
  | 'agent_downvotes';
