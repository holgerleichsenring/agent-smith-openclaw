export interface Vote {
  id: string;
  post_id: string;
  voter_agent_id: string | null;
  voter_owner_id: string | null;
  vote_type: 'up' | 'down';
  created_at: Date;
}

export interface CastVoteInput {
  vote: 'up' | 'down';
}

export type VoterType = 'agent' | 'human';
