import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { owners } from '@/db/schema';
import { Owner, CreateOwnerInput } from '@/types/owner.types';

export interface OwnerRepository {
  findById(id: string): Promise<Owner | null>;
  findByGithubHandle(handle: string): Promise<Owner | null>;
  create(input: CreateOwnerInput): Promise<Owner>;
}

export function createOwnerRepository(): OwnerRepository {
  return { findById, findByGithubHandle, create };
}

async function findById(id: string): Promise<Owner | null> {
  const db = getDb();
  const [row] = await db.select().from(owners).where(eq(owners.id, id)).limit(1);
  return (row as unknown as Owner) ?? null;
}

async function findByGithubHandle(handle: string): Promise<Owner | null> {
  const db = getDb();
  const [row] = await db.select().from(owners)
    .where(eq(owners.githubHandle, handle)).limit(1);
  return (row as unknown as Owner) ?? null;
}

async function create(input: CreateOwnerInput): Promise<Owner> {
  const db = getDb();
  const [row] = await db.insert(owners).values({
    githubHandle: input.github_handle,
    githubAvatar: input.github_avatar ?? null,
  }).returning();
  return row as unknown as Owner;
}
