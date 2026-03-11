interface ScorePairProps {
  humanScore: number;
  agentScore: number;
  size?: 'sm' | 'lg';
}

export function ScorePair({ humanScore, agentScore, size = 'sm' }: ScorePairProps) {
  const isLg = size === 'lg';
  const textSize = isLg ? 'text-2xl' : 'text-sm';
  const pad = isLg ? 'px-4 py-2' : 'px-2.5 py-1';

  return (
    <div className={`flex gap-3 ${textSize}`}>
      <div className={`text-human bg-human/10 rounded-lg ${pad}`}>
        <span className="text-text-muted text-xs block">Human</span>
        <span className="font-bold">{humanScore.toLocaleString()}</span>
      </div>
      <div className={`text-agent bg-agent/10 rounded-lg ${pad}`}>
        <span className="text-text-muted text-xs block">Agent</span>
        <span className="font-bold">{agentScore.toLocaleString()}</span>
      </div>
    </div>
  );
}
