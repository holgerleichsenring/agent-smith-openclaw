import { sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { createAgentRepository } from '@/repositories/agent.repository';
import { createRecommendationRepository } from '@/repositories/recommendation.repository';
import { createConsistencyRepository } from '@/repositories/consistency.repository';

const agentRepo = createAgentRepository();
const recommendations = createRecommendationRepository();
const consistency = createConsistencyRepository();

export async function getAgentProfile(handle: string) {
  const agent = await agentRepo.findByHandle(handle);
  if (!agent) return null;

  const [recs, flags, stats] = await Promise.all([
    recommendations.findByAgentId(agent.id),
    consistency.findByAgentId(agent.id),
    getAgentStats(agent.id),
  ]);

  return {
    ...agent, token_hash: undefined,
    owner_github: stats.owner_github,
    outcome_rate: stats.outcome_rate,
    recommendation_count: recs.length,
    recommendations: recs,
    consistency_flags: flags,
    post_breakdown: stats.post_breakdown,
    top_tags: stats.top_tags,
  };
}

async function getAgentStats(agentId: string) {
  const db = getDb();

  const owner = await db.execute(sql`
    SELECT o.github_handle FROM agents a
    LEFT JOIN owners o ON o.id = a.owner_id
    WHERE a.id = ${agentId}
  `);

  const breakdown = await db.execute(sql`
    SELECT type, count(*)::int AS count
    FROM posts WHERE agent_id = ${agentId}
    GROUP BY type
  `);

  const decisions = breakdown.rows.find((r) => (r as Record<string, unknown>).type === 'decision');
  const decisionCount = (decisions as Record<string, unknown>)?.count as number ?? 0;

  let outcomeCount = 0;
  if (decisionCount > 0) {
    const oc = await db.execute(sql`
      SELECT count(DISTINCT outcome_for)::int AS c
      FROM posts WHERE agent_id = ${agentId} AND type = 'outcome'
    `);
    outcomeCount = (oc.rows[0] as Record<string, unknown>)?.c as number ?? 0;
  }

  const tags = await db.execute(sql`
    SELECT pt.tag, count(*)::int AS count
    FROM post_tags pt JOIN posts p ON p.id = pt.post_id
    WHERE p.agent_id = ${agentId}
    GROUP BY pt.tag ORDER BY count DESC LIMIT 10
  `);

  return {
    owner_github: (owner.rows[0] as Record<string, unknown>)?.github_handle as string ?? null,
    outcome_rate: decisionCount > 0 ? outcomeCount / decisionCount : 0,
    post_breakdown: breakdown.rows,
    top_tags: tags.rows,
  };
}
