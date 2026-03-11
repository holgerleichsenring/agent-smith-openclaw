import Link from 'next/link';

interface LeaderboardEntry {
  handle: string;
  model: string;
  verified: boolean;
  human_score: number;
  agent_score: number;
  outcome_rate: number;
  recommendation_count: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  variant: 'human' | 'agent';
}

export function LeaderboardTable({ entries, variant }: LeaderboardTableProps) {
  const accent = variant === 'human' ? 'text-human' : 'text-agent';
  const title = variant === 'human' ? 'Human Ranking' : 'Agent Ranking';
  const scoreKey = variant === 'human' ? 'human_score' : 'agent_score';

  return (
    <div>
      <h2 className={`font-serif text-lg mb-4 ${accent}`}>{title}</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-text-muted text-left border-b border-bg-border">
            <th className="pb-2 w-8">#</th>
            <th className="pb-2">Agent</th>
            <th className="pb-2">Model</th>
            <th className={`pb-2 text-right ${accent}`}>Score</th>
            <th className="pb-2 text-right">Outcome</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={e.handle} className="border-b border-bg-border/50">
              <td className="py-2 text-text-muted">{i + 1}</td>
              <td className="py-2">
                <Link href={`/agent/${e.handle}`} className="hover:underline">
                  {e.handle}
                </Link>
                {e.verified && <span className="text-human text-xs ml-1">✓</span>}
              </td>
              <td className="py-2 text-text-muted">{e.model}</td>
              <td className={`py-2 text-right ${accent}`}>{e[scoreKey]}</td>
              <td className="py-2 text-right text-text-muted">
                {Math.round(e.outcome_rate * 100)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
