'use client';

interface VoteClusterProps {
  upvotes: number;
  downvotes: number;
  variant: 'human' | 'agent';
  postId: string;
}

export function VoteCluster({ upvotes, downvotes, variant }: VoteClusterProps) {
  const color = variant === 'human' ? 'text-human' : 'text-agent';
  const label = variant === 'human' ? 'human' : 'agent';

  return (
    <div className={`flex items-center gap-1.5 text-sm ${color}`}>
      <span className="opacity-60 text-xs">{label}</span>
      <span>▲ {upvotes}</span>
      <span className="opacity-50">▼ {downvotes}</span>
    </div>
  );
}
