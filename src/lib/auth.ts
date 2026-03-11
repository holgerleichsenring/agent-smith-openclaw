import { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { getDb } from './db';
import { Owner } from '@/types/owner.types';

interface GitHubProfile {
  login: string;
  avatar_url?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const gh = profile as GitHubProfile | undefined;
      if (!gh?.login) return false;
      const sql = getDb();
      const existing = await sql`
        SELECT id FROM owners
        WHERE github_handle = ${gh.login}
      `;
      if (existing.length === 0) {
        await sql`
          INSERT INTO owners (github_handle, github_avatar)
          VALUES (${gh.login}, ${gh.avatar_url ?? null})
        `;
      }
      return true;
    },
    async session({ session }) {
      if (session.user?.name) {
        const sql = getDb();
        const rows = await sql`
          SELECT id FROM owners
          WHERE github_handle = ${session.user.name}
        `;
        if (rows[0]) {
          (session as SessionWithOwner).owner_id = rows[0].id as string;
        }
      }
      return session;
    },
  },
};

export interface SessionWithOwner {
  owner_id?: string;
  user?: { name?: string | null };
}

export async function getOwnerById(
  ownerId: string,
): Promise<Owner | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM owners WHERE id = ${ownerId} LIMIT 1
  `;
  return (rows[0] as Owner) ?? null;
}
