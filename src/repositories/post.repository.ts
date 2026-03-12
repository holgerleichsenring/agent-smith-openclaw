import { eq, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { posts } from '@/db/schema';
import { Post, VoteColumn, Alternative, ConfidenceLevel } from '@/types/post.types';

export interface StructuredFields {
  reasoning?: string;
  alternatives?: Alternative[];
  confidence?: ConfidenceLevel;
  context?: string;
  auditStatus?: string;
}

export interface PostRepository {
  create(agentId: string, content: string, type: string, fields?: StructuredFields, threadId?: string, outcomeFor?: string): Promise<Post>;
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
  fields?: StructuredFields, threadId?: string, outcomeFor?: string,
): Promise<Post> {
  const db = getDb();
  const [row] = await db.insert(posts).values({
    agentId, content, type,
    threadId: threadId ?? null,
    outcomeFor: outcomeFor ?? null,
    reasoning: fields?.reasoning ?? null,
    alternatives: fields?.alternatives ?? [],
    confidence: fields?.confidence ?? null,
    context: fields?.context ?? null,
    auditStatus: fields?.auditStatus ?? null,
  }).returning();
  return row as unknown as Post;
}

async function findById(id: string): Promise<Post | null> {
  const db = getDb();
  const [row] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return (row as unknown as Post) ?? null;
}

async function findByAgentId(agentId: string): Promise<Post[]> {
  const db = getDb();
  const rows = await db.select().from(posts)
    .where(eq(posts.agentId, agentId))
    .orderBy(sql`created_at DESC`);
  return rows as unknown as Post[];
}

async function findByThreadId(threadId: string): Promise<Post[]> {
  const db = getDb();
  const rows = await db.select().from(posts)
    .where(eq(posts.threadId, threadId))
    .orderBy(sql`created_at ASC`);
  return rows as unknown as Post[];
}

async function findOutcomesFor(postId: string): Promise<Post[]> {
  const db = getDb();
  const rows = await db.select().from(posts)
    .where(eq(posts.outcomeFor, postId))
    .orderBy(sql`created_at ASC`);
  return rows as unknown as Post[];
}

async function retract(id: string, reason: string): Promise<void> {
  const db = getDb();
  await db.update(posts)
    .set({ retracted: true, retractionReason: reason })
    .where(eq(posts.id, id));
}

async function incrementVoteCount(
  id: string, column: VoteColumn,
): Promise<void> {
  const db = getDb();
  const colMap = {
    human_upvotes: posts.humanUpvotes,
    human_downvotes: posts.humanDownvotes,
    agent_upvotes: posts.agentUpvotes,
    agent_downvotes: posts.agentDownvotes,
  };
  const col = colMap[column];
  await db.update(posts)
    .set({ [column]: sql`${col} + 1` })
    .where(eq(posts.id, id));
}
