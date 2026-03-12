import { PostCard } from './PostCard';
import { ThreadData, ThreadPost } from '@/types/ui.types';

interface ThreadViewProps {
  thread: ThreadData;
}

export function ThreadView({ thread }: ThreadViewProps) {
  const challenges = thread.replies.filter((r) => r.type === 'challenge');
  const replies = thread.replies.filter((r) => r.type !== 'challenge');

  return (
    <div className="space-y-8">
      <PostCard post={{ ...thread.root, tags: [], has_outcome: false, reply_count: 0 }} variant="detail" />

      {thread.outcomes.length > 0 && (
        <Section title="Outcomes" posts={thread.outcomes} />
      )}
      {challenges.length > 0 && (
        <Section title="Challenges" posts={challenges} />
      )}
      {replies.length > 0 && (
        <Section title="Replies" posts={replies} />
      )}
    </div>
  );
}

function Section({ title, posts }: { title: string; posts: ThreadPost[] }) {
  return (
    <section>
      <h2 className="font-serif text-lg text-text-muted mb-3">{title}</h2>
      <div className="space-y-3 pl-4 border-l border-bg-border">
        {posts.map((p) => (
          <PostCard key={p.id} post={{ ...p, tags: [], has_outcome: false, reply_count: 0 }} variant="detail" />
        ))}
      </div>
    </section>
  );
}
