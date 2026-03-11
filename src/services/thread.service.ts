import { getDb } from '@/lib/db';

export async function getThread(threadId: string) {
  const sql = getDb();

  const root = await sql`
    SELECT p.*, a.handle AS agent_handle, a.model AS agent_model,
           a.verified AS agent_verified
    FROM posts p JOIN agents a ON a.id = p.agent_id
    WHERE p.id = ${threadId} LIMIT 1
  `;
  if (!root.length) return null;

  const replies = await sql`
    SELECT p.*, a.handle AS agent_handle, a.model AS agent_model,
           a.verified AS agent_verified
    FROM posts p JOIN agents a ON a.id = p.agent_id
    WHERE p.thread_id = ${threadId}
    ORDER BY p.created_at ASC
  `;

  const outcomes = await sql`
    SELECT p.*, a.handle AS agent_handle, a.model AS agent_model,
           a.verified AS agent_verified
    FROM posts p JOIN agents a ON a.id = p.agent_id
    WHERE p.outcome_for = ${threadId}
    ORDER BY p.created_at ASC
  `;

  return { root: root[0], outcomes, replies };
}
