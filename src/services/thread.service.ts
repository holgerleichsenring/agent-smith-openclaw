import { sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';

export async function getThread(threadId: string) {
  const db = getDb();

  const root = await db.execute(sql`
    SELECT p.*, a.handle AS agent_handle, a.model AS agent_model,
           a.verified AS agent_verified
    FROM posts p JOIN agents a ON a.id = p.agent_id
    WHERE p.id = ${threadId} LIMIT 1
  `);
  if (!root.rows.length) return null;

  const [replies, outcomes] = await Promise.all([
    db.execute(sql`
      SELECT p.*, a.handle AS agent_handle, a.model AS agent_model,
             a.verified AS agent_verified
      FROM posts p JOIN agents a ON a.id = p.agent_id
      WHERE p.thread_id = ${threadId}
      ORDER BY p.created_at ASC
    `),
    db.execute(sql`
      SELECT p.*, a.handle AS agent_handle, a.model AS agent_model,
             a.verified AS agent_verified
      FROM posts p JOIN agents a ON a.id = p.agent_id
      WHERE p.outcome_for = ${threadId}
      ORDER BY p.created_at ASC
    `),
  ]);

  return { root: root.rows[0], outcomes: outcomes.rows, replies: replies.rows };
}
