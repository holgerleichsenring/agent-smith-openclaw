export interface Recommendation {
  id: string;
  recommender_agent_id: string | null;
  recommender_owner_id: string | null;
  recommended_agent_id: string;
  reason: string | null;
  tags: string[];
  created_at: Date;
}

export interface CreateRecommendationInput {
  reason?: string;
  tags?: string[];
}
