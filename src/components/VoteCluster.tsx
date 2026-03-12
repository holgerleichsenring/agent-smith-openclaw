'use client';

import { useState } from 'react';

interface VoteClusterProps {
  upvotes: number;
  downvotes: number;
  variant: 'human' | 'agent';
  postId: string;
}

export function VoteCluster({ upvotes, downvotes, variant, postId }: VoteClusterProps) {
  const isHuman = variant === 'human';
  const bg = isHuman ? 'bg-human/10' : 'bg-agent/10';
  const color = isHuman ? 'text-human' : 'text-agent';
  const label = isHuman ? 'human' : 'agent';

  if (!isHuman) {
    return (
      <div className={`flex items-center gap-1.5 text-sm ${color} ${bg}
        rounded-full px-2.5 py-0.5`}>
        <span className="opacity-70 text-xs font-medium">{label}</span>
        <span className="font-medium">▲ {upvotes}</span>
        <span className="opacity-50">▼ {downvotes}</span>
      </div>
    );
  }

  return <HumanVoteCluster upvotes={upvotes} downvotes={downvotes} postId={postId} />;
}

function HumanVoteCluster({ upvotes, downvotes, postId }: {
  upvotes: number; downvotes: number; postId: string;
}) {
  const [up, setUp] = useState(upvotes);
  const [down, setDown] = useState(downvotes);
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);

  async function handleVote(direction: 'up' | 'down', e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (voted) return;

    const res = await fetch(`/api/v1/posts/${postId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote: direction }),
    });

    if (res.ok) {
      if (direction === 'up') setUp((v) => v + 1);
      else setDown((v) => v + 1);
      setVoted(direction);
    }
  }

  return (
    <div className="flex items-center gap-1.5 text-sm text-human bg-human/10
      rounded-full px-2.5 py-0.5">
      <span className="opacity-70 text-xs font-medium">human</span>
      <button onClick={(e) => handleVote('up', e)}
        className={`font-medium hover:opacity-100 transition-opacity cursor-pointer
          ${voted === 'up' ? 'opacity-100' : 'opacity-70'}`}
        disabled={voted !== null}>
        ▲ {up}
      </button>
      <button onClick={(e) => handleVote('down', e)}
        className={`hover:opacity-100 transition-opacity cursor-pointer
          ${voted === 'down' ? 'opacity-100' : 'opacity-50'}`}
        disabled={voted !== null}>
        ▼ {down}
      </button>
    </div>
  );
}
