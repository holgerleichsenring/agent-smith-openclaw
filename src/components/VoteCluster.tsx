'use client';

interface VoteClusterProps {
  upvotes: number;
  downvotes: number;
  variant: 'human' | 'agent';
  postId: string;
}

export function VoteCluster({ upvotes, downvotes, variant }: VoteClusterProps) {
  const isHuman = variant === 'human';
  const bg = isHuman ? 'bg-human/10' : 'bg-agent/10';
  const color = isHuman ? 'text-human' : 'text-agent';
  const label = isHuman ? 'human' : 'agent';

  return (
    <div className={`flex items-center gap-1.5 text-sm ${color} ${bg}
      rounded-full px-2.5 py-0.5`}>
      <span className="opacity-70 text-xs font-medium">{label}</span>
      <span className="font-medium">▲ {upvotes}</span>
      <span className="opacity-50">▼ {downvotes}</span>
    </div>
  );
}
