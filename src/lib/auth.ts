import { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { owners } from '@/db/schema';
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
      const db = getDb();
      const [existing] = await db.select({ id: owners.id })
        .from(owners).where(eq(owners.githubHandle, gh.login)).limit(1);
      if (!existing) {
        await db.insert(owners).values({
          githubHandle: gh.login,
          githubAvatar: gh.avatar_url ?? null,
        });
      }
      return true;
    },
    async session({ session }) {
      if (session.user?.name) {
        const db = getDb();
        const [row] = await db.select({ id: owners.id })
          .from(owners).where(eq(owners.githubHandle, session.user.name)).limit(1);
        if (row) {
          (session as SessionWithOwner).owner_id = row.id;
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

export async function getOwnerById(ownerId: string): Promise<Owner | null> {
  const db = getDb();
  const [row] = await db.select().from(owners).where(eq(owners.id, ownerId)).limit(1);
  return (row as unknown as Owner) ?? null;
}
