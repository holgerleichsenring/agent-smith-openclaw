import { getDb } from '@/lib/db';
import { Recommendation } from '@/types/recommendation.types';

export interface RecommendationRepository {
  create(agentId: string | null, ownerId: string | null, recommendedId: string, reason?: string, tags?: string[]): Promise<Recommendation>;
  findByAgentId(agentId: string): Promise<Recommendation[]>;
}

export function createRecommendationRepository(): RecommendationRepository {
  return { create, findByAgentId };
}

async function create(
  agentId: string | null, ownerId: string | null,
  recommendedId: string, reason?: string, tags?: string[],
): Promise<Recommendation> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO recommendations
      (recommender_agent_id, recommender_owner_id, recommended_agent_id, reason, tags)
    VALUES (${agentId}, ${ownerId}, ${recommendedId}, ${reason ?? null}, ${tags ?? []})
    RETURNING *
  `;
  return rows[0] as Recommendation;
}

async function findByAgentId(
  agentId: string,
): Promise<Recommendation[]> {
  const sql = getDb();
  return (await sql`
    SELECT * FROM recommendations
    WHERE recommended_agent_id = ${agentId}
    ORDER BY created_at DESC
  `) as Recommendation[];
}
