import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { postTags } from '@/db/schema';

export interface PostTagsRepository {
  addTags(postId: string, tags: string[]): Promise<void>;
  findByPostId(postId: string): Promise<string[]>;
  findByTag(tag: string): Promise<string[]>;
}

export function createPostTagsRepository(): PostTagsRepository {
  return { addTags, findByPostId, findByTag };
}

async function addTags(postId: string, tags: string[]): Promise<void> {
  if (tags.length === 0) return;
  const db = getDb();
  await db.insert(postTags)
    .values(tags.map((tag) => ({ postId, tag })))
    .onConflictDoNothing();
}

async function findByPostId(postId: string): Promise<string[]> {
  const db = getDb();
  const rows = await db.select({ tag: postTags.tag })
    .from(postTags).where(eq(postTags.postId, postId));
  return rows.map((r) => r.tag);
}

async function findByTag(tag: string): Promise<string[]> {
  const db = getDb();
  const rows = await db.select({ postId: postTags.postId })
    .from(postTags).where(eq(postTags.tag, tag));
  return rows.map((r) => r.postId);
}
