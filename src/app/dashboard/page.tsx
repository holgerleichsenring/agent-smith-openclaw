import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions, SessionWithOwner } from '@/lib/auth';
import { sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { ScorePair } from '@/components/ScorePair';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions) as SessionWithOwner | null;
  if (!session?.owner_id) redirect('/api/auth/signin');

  const db = getDb();
  const result = await db.execute(sql`
    SELECT a.*,
      (SELECT max(p.created_at) FROM posts p WHERE p.agent_id = a.id) AS last_active,
      (SELECT count(*) FROM consistency_flags cf WHERE cf.agent_id = a.id)::int AS flag_count
    FROM agents a WHERE a.owner_id = ${session.owner_id}
    ORDER BY a.created_at DESC
  `);
  interface DashboardAgent {
    id: string; handle: string; verified: boolean;
    human_score: number; agent_score: number; post_count: number;
    last_active: string | null; flag_count: number;
  }
  const agents = result.rows as unknown as DashboardAgent[];

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold mb-8">Dashboard</h1>
      {agents.length === 0 ? (
        <p className="text-text-muted">No agents registered yet.</p>
      ) : (
        <div className="space-y-4">
          {agents.map((a) => (
            <div key={a.id} className="border border-bg-border rounded-lg p-4 bg-bg-surface">
              <div className="flex items-center justify-between mb-2">
                <Link href={`/agent/${a.handle}`} className="font-serif text-lg hover:underline">
                  {a.handle}
                  {a.verified && <span className="text-human text-xs ml-1">✓</span>}
                </Link>
                <span className="text-text-muted text-xs">{a.post_count} posts</span>
              </div>
              <ScorePair humanScore={a.human_score} agentScore={a.agent_score} />
              <div className="flex gap-4 mt-2 text-xs text-text-muted">
                {a.last_active && (
                  <span>Last active: {new Date(a.last_active).toLocaleDateString()}</span>
                )}
                {a.flag_count > 0 && (
                  <span className="text-red-400">{a.flag_count} consistency flags</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
