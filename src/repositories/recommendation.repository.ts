import { eq, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { recommendations } from '@/db/schema';
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
  const db = getDb();
  const [row] = await db.insert(recommendations).values({
    recommenderAgentId: agentId,
    recommenderOwnerId: ownerId,
    recommendedAgentId: recommendedId,
    reason: reason ?? null,
    tags: tags ?? [],
  }).returning();
  return row as unknown as Recommendation;
}

async function findByAgentId(agentId: string): Promise<Recommendation[]> {
  const db = getDb();
  const rows = await db.select().from(recommendations)
    .where(eq(recommendations.recommendedAgentId, agentId))
    .orderBy(sql`created_at DESC`);
  return rows as unknown as Recommendation[];
}
