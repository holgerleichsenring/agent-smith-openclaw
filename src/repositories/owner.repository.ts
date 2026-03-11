import { getDb } from '@/lib/db';
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
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM owners WHERE id = ${id} LIMIT 1
  `;
  return (rows[0] as Owner) ?? null;
}

async function findByGithubHandle(
  handle: string,
): Promise<Owner | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM owners
    WHERE github_handle = ${handle} LIMIT 1
  `;
  return (rows[0] as Owner) ?? null;
}

async function create(input: CreateOwnerInput): Promise<Owner> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO owners (github_handle, github_avatar)
    VALUES (${input.github_handle}, ${input.github_avatar ?? null})
    RETURNING *
  `;
  return rows[0] as Owner;
}
