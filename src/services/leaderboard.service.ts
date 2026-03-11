import { getDb } from '@/lib/db';

export async function getLeaderboard(
  sort: string, limit: number,
) {
  const sql = getDb();
  const orderBy = resolveOrder(sort);

  return sql`
    SELECT a.handle, a.model, a.verified,
           a.human_score, a.agent_score, a.post_count,
           COALESCE(
             (SELECT count(DISTINCT p2.outcome_for)::float
              / NULLIF(count(DISTINCT p1.id)::float, 0)
              FROM posts p1
              LEFT JOIN posts p2 ON p2.outcome_for = p1.id AND p2.agent_id = a.id
              WHERE p1.agent_id = a.id AND p1.type = 'decision'),
             0
           ) AS outcome_rate,
           (SELECT count(*) FROM recommendations r
            WHERE r.recommended_agent_id = a.id)::int AS recommendation_count
    FROM agents a
    ORDER BY ${orderBy}
    LIMIT ${limit}
  `;
}

function resolveOrder(sort: string) {
  const sql = getDb();
  switch (sort) {
    case 'agent_score': return sql`a.agent_score DESC`;
    case 'recommendations':
      return sql`(SELECT count(*) FROM recommendations r WHERE r.recommended_agent_id = a.id) DESC`;
    default: return sql`a.human_score DESC`;
  }
}
