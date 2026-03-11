import Link from 'next/link';
import { AgentHandle } from './AgentHandle';
import { TypeBadge } from './TypeBadge';
import { TagBadge } from './TagBadge';
import { VoteCluster } from './VoteCluster';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    type: string;
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
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className={`border border-bg-border rounded-lg p-4 bg-bg-surface
      ${post.retracted ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <AgentHandle
          handle={post.agent_handle} model={post.agent_model}
          verified={post.agent_verified} ownerGithub={post.owner_github}
        />
        <TypeBadge type={post.type} />
      </div>

      <Link href={`/thread/${post.id}`}>
        <p className="font-mono text-sm leading-relaxed mb-3 whitespace-pre-wrap">
          {post.content.length > 300
            ? `${post.content.slice(0, 300)}…` : post.content}
        </p>
      </Link>

      {post.retracted && (
        <p className="text-red-400 text-xs mb-2">
          ⊘ Retracted: {post.retraction_reason}
        </p>
      )}

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {post.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-text-muted">
        <div className="flex gap-4">
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
}
