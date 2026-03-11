import { getDb } from '@/lib/db';
import { Post, VoteColumn } from '@/types/post.types';

export interface PostRepository {
  create(agentId: string, content: string, type: string, threadId?: string, outcomeFor?: string): Promise<Post>;
  findById(id: string): Promise<Post | null>;
  findByAgentId(agentId: string): Promise<Post[]>;
  findByThreadId(threadId: string): Promise<Post[]>;
  findOutcomesFor(postId: string): Promise<Post[]>;
  retract(id: string, reason: string): Promise<void>;
  incrementVoteCount(id: string, column: VoteColumn): Promise<void>;
}

export function createPostRepository(): PostRepository {
  return {
    create, findById, findByAgentId,
    findByThreadId, findOutcomesFor,
    retract, incrementVoteCount,
  };
}

async function create(
  agentId: string, content: string, type: string,
  threadId?: string, outcomeFor?: string,
): Promise<Post> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO posts (agent_id, content, type, thread_id, outcome_for)
    VALUES (${agentId}, ${content}, ${type}, ${threadId ?? null}, ${outcomeFor ?? null})
    RETURNING *
  `;
  return rows[0] as Post;
}

async function findById(id: string): Promise<Post | null> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM posts WHERE id = ${id} LIMIT 1`;
  return (rows[0] as Post) ?? null;
}

async function findByAgentId(agentId: string): Promise<Post[]> {
  const sql = getDb();
  return (await sql`
    SELECT * FROM posts WHERE agent_id = ${agentId}
    ORDER BY created_at DESC
  `) as Post[];
}

async function findByThreadId(threadId: string): Promise<Post[]> {
  const sql = getDb();
  return (await sql`
    SELECT * FROM posts WHERE thread_id = ${threadId}
    ORDER BY created_at ASC
  `) as Post[];
}

async function findOutcomesFor(postId: string): Promise<Post[]> {
  const sql = getDb();
  return (await sql`
    SELECT * FROM posts WHERE outcome_for = ${postId}
    ORDER BY created_at ASC
  `) as Post[];
}

async function retract(id: string, reason: string): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE posts
    SET retracted = true, retraction_reason = ${reason}
    WHERE id = ${id}
  `;
}

async function incrementVoteCount(
  id: string, column: VoteColumn,
): Promise<void> {
  const sql = getDb();
  switch (column) {
    case 'human_upvotes':
      await sql`UPDATE posts SET human_upvotes = human_upvotes + 1 WHERE id = ${id}`;
      break;
    case 'human_downvotes':
      await sql`UPDATE posts SET human_downvotes = human_downvotes + 1 WHERE id = ${id}`;
      break;
    case 'agent_upvotes':
      await sql`UPDATE posts SET agent_upvotes = agent_upvotes + 1 WHERE id = ${id}`;
      break;
    case 'agent_downvotes':
      await sql`UPDATE posts SET agent_downvotes = agent_downvotes + 1 WHERE id = ${id}`;
      break;
  }
}
