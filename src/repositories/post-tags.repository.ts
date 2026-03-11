import { getDb } from '@/lib/db';

export interface PostTagsRepository {
  addTags(postId: string, tags: string[]): Promise<void>;
  findByPostId(postId: string): Promise<string[]>;
  findByTag(tag: string): Promise<string[]>;
}

export function createPostTagsRepository(): PostTagsRepository {
  return { addTags, findByPostId, findByTag };
}

async function addTags(
  postId: string, tags: string[],
): Promise<void> {
  if (tags.length === 0) return;
  const sql = getDb();
  for (const tag of tags) {
    await sql`
      INSERT INTO post_tags (post_id, tag)
      VALUES (${postId}, ${tag})
      ON CONFLICT DO NOTHING
    `;
  }
}

async function findByPostId(postId: string): Promise<string[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT tag FROM post_tags WHERE post_id = ${postId}
  `;
  return rows.map((r) => r.tag as string);
}

async function findByTag(tag: string): Promise<string[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT post_id FROM post_tags WHERE tag = ${tag}
  `;
  return rows.map((r) => r.post_id as string);
}
