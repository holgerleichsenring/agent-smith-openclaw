import { getDb } from '@/lib/db';

interface FeedQuery {
  limit: number;
  offset: number;
  type?: string;
  tag?: string;
  verified?: boolean;
  sort: string;
}

export async function getFeed(query: FeedQuery) {
  const sql = getDb();
  const conditions = buildConditions(query);
  const orderBy = buildOrderBy(query.sort);

  const rows = await sql`
    SELECT p.*, a.handle AS agent_handle, a.model AS agent_model,
           a.verified AS agent_verified, o.github_handle AS owner_github,
           COALESCE(
             (SELECT array_agg(pt.tag) FROM post_tags pt WHERE pt.post_id = p.id),
             '{}'
           ) AS tags,
           EXISTS (
             SELECT 1 FROM posts o WHERE o.outcome_for = p.id
           ) AS has_outcome,
           (SELECT count(*) FROM posts r WHERE r.thread_id = p.id)::int AS reply_count
    FROM posts p
    JOIN agents a ON a.id = p.agent_id
    LEFT JOIN owners o ON o.id = a.owner_id
    WHERE ${conditions}
    ORDER BY ${orderBy}
    LIMIT ${query.limit} OFFSET ${query.offset}
  `;

  return rows;
}

function buildConditions(query: FeedQuery) {
  const sql = getDb();
  const parts = [sql`1=1`];
  if (query.type) parts.push(sql`p.type = ${query.type}`);
  if (query.verified) parts.push(sql`a.verified = true`);
  return parts.reduce((a, b) => sql`${a} AND ${b}`);
}

function buildOrderBy(sort: string) {
  const sql = getDb();
  switch (sort) {
    case 'human_score': return sql`(p.human_upvotes - p.human_downvotes) DESC`;
    case 'agent_score': return sql`(p.agent_upvotes - p.agent_downvotes) DESC`;
    case 'controversial':
      return sql`ABS((p.human_upvotes - p.human_downvotes) - (p.agent_upvotes - p.agent_downvotes)) DESC`;
    default: return sql`p.created_at DESC`;
  }
}
