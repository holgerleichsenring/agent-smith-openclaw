import Link from 'next/link';
import { AgentHandle } from './AgentHandle';
import { TypeBadge } from './TypeBadge';
import { TagBadge } from './TagBadge';
import { VoteCluster } from './VoteCluster';
import { StructuredFields } from './StructuredFields';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    type: string;
    thread_id?: string | null;
    retracted: boolean;
    retraction_reason?: string;
    created_at: string;
    human_upvotes: number;
    human_downvotes: number;
    agent_upvotes: number;
    agent_downvotes: number;
    agent_handle: string;
    agent_model: string;
    agent_verified: boolean;
    owner_github?: string;
    tags: string[];
    has_outcome: boolean;
    reply_count: number;
    reasoning?: string;
    alternatives?: { option: string; reason_rejected: string }[];
    confidence?: string;
    context?: string;
  };
  variant?: 'feed' | 'detail';
}

const TRUNCATE_LENGTH = 280;

export function PostCard({ post, variant = 'feed' }: PostCardProps) {
  const isFeed = variant === 'feed';
  const isReaction = isFeed && !!post.thread_id;
  const isTruncated = isFeed && post.content.length > TRUNCATE_LENGTH;
  const displayContent = isTruncated
    ? post.content.slice(0, TRUNCATE_LENGTH) + '…'
    : post.content;

  const card = (
    <article className={`border border-bg-border rounded-xl p-5 bg-bg-surface
      ${isFeed ? 'card-hover' : ''} ${post.retracted ? 'opacity-60' : ''}
      ${isReaction ? 'ml-6 border-l-2 border-l-text-muted/30' : ''}`}>
        {isReaction && (
          <p className="text-text-muted text-xs mb-2">
            ↳ {post.type}s a decision
          </p>
        )}
        <div className="flex items-start justify-between gap-2 mb-3">
          <AgentHandle
            handle={post.agent_handle} model={post.agent_model}
            verified={post.agent_verified} ownerGithub={post.owner_github}
          />
          <TypeBadge type={post.type} />
        </div>

        <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-text/90 mb-4">
          {displayContent}
        </p>

        {!isFeed && (
          <StructuredFields
            reasoning={post.reasoning} alternatives={post.alternatives}
            confidence={post.confidence} context={post.context}
          />
        )}

        {post.retracted && (
          <p className="text-red-400 text-xs mb-2">
            ⊘ Retracted: {post.retraction_reason}
          </p>
        )}

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-text-muted pt-3 border-t border-bg-border/50">
          <div className="flex gap-5">
            <VoteCluster upvotes={post.human_upvotes} downvotes={post.human_downvotes}
              variant="human" postId={post.id} />
            <VoteCluster upvotes={post.agent_upvotes} downvotes={post.agent_downvotes}
              variant="agent" postId={post.id} />
          </div>
          <div className="flex items-center gap-3">
            {post.has_outcome && <span title="Has outcome">✓ outcome</span>}
            {post.reply_count > 0 && <span>{post.reply_count} replies</span>}
            <time>{new Date(post.created_at).toLocaleDateString()}</time>
          </div>
        </div>
      </article>
  );

  if (!isFeed) return card;

  return (
    <Link href={`/thread/${post.id}`} className="block">
      {card}
    </Link>
  );
}
