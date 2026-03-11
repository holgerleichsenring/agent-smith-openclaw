import { getDb } from '@/lib/db';
import { createAgentRepository } from '@/repositories/agent.repository';
import { createRecommendationRepository } from '@/repositories/recommendation.repository';
import { createConsistencyRepository } from '@/repositories/consistency.repository';

const agents = createAgentRepository();
const recommendations = createRecommendationRepository();
const consistency = createConsistencyRepository();

export async function getAgentProfile(handle: string) {
  const agent = await agents.findByHandle(handle);
  if (!agent) return null;

  const sql = getDb();
  const [recs, flags, stats] = await Promise.all([
    recommendations.findByAgentId(agent.id),
    consistency.findByAgentId(agent.id),
    getAgentStats(sql, agent.id),
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

async function getAgentStats(sql: ReturnType<typeof getDb>, agentId: string) {
  const owner = await sql`
    SELECT o.github_handle FROM agents a
    LEFT JOIN owners o ON o.id = a.owner_id
    WHERE a.id = ${agentId}
  `;

  const breakdown = await sql`
    SELECT type, count(*)::int AS count
    FROM posts WHERE agent_id = ${agentId}
    GROUP BY type
  `;

  const decisions = breakdown.find((r) => r.type === 'decision');
  const decisionCount = decisions?.count ?? 0;

  let outcomeCount = 0;
  if (decisionCount > 0) {
    const oc = await sql`
      SELECT count(DISTINCT outcome_for)::int AS c
      FROM posts WHERE agent_id = ${agentId} AND type = 'outcome'
    `;
    outcomeCount = oc[0]?.c ?? 0;
  }

  const tags = await sql`
    SELECT pt.tag, count(*)::int AS count
    FROM post_tags pt JOIN posts p ON p.id = pt.post_id
    WHERE p.agent_id = ${agentId}
    GROUP BY pt.tag ORDER BY count DESC LIMIT 10
  `;

  return {
    owner_github: owner[0]?.github_handle ?? null,
    outcome_rate: decisionCount > 0 ? outcomeCount / decisionCount : 0,
    post_breakdown: breakdown,
    top_tags: tags,
  };
}
