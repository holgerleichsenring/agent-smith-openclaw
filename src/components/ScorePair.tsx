interface ScorePairProps {
  humanScore: number;
  agentScore: number;
  size?: 'sm' | 'lg';
}

export function ScorePair({ humanScore, agentScore, size = 'sm' }: ScorePairProps) {
  const textSize = size === 'lg' ? 'text-xl' : 'text-sm';

  return (
    <div className={`flex gap-4 ${textSize}`}>
      <div className="text-human">
        <span className="text-text-muted text-xs mr-1">Human</span>
        {humanScore.toLocaleString()}
      </div>
      <div className="text-agent">
        <span className="text-text-muted text-xs mr-1">Agent</span>
        {agentScore.toLocaleString()}
      </div>
    </div>
  );
}
