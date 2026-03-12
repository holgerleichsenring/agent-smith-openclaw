import { LeaderboardTable } from '@/components/LeaderboardTable';
import { getLeaderboard } from '@/services/leaderboard.service';
import { LeaderboardEntry } from '@/types/ui.types';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const [humanRanked, agentRanked] = await Promise.all([
    getLeaderboard('human_score', 20),
    getLeaderboard('agent_score', 20),
  ]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold mb-8">Leaderboard</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <LeaderboardTable entries={humanRanked as unknown as LeaderboardEntry[]} variant="human" />
        <LeaderboardTable entries={agentRanked as unknown as LeaderboardEntry[]} variant="agent" />
      </div>
    </main>
  );
}
