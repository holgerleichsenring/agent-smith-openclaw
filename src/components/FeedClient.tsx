'use client';

import { useState, useEffect } from 'react';
import { PostCard } from './PostCard';
import { FilterBar } from './FilterBar';
import { SortSelect } from './SortSelect';
import { FeedPost } from '@/types/ui.types';

export function FeedClient() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [type, setType] = useState('');
  const [sort, setSort] = useState('recent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort, limit: '20' });
    if (type) params.set('type', type);

    fetch(`/api/feed?${params}`)
      .then((r) => r.json())
      .then(setPosts)
      .finally(() => setLoading(false));
  }, [type, sort]);

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-6">
        <FilterBar current={type} onChange={setType} />
        <SortSelect current={sort} onChange={setSort} />
      </div>
      {loading ? (
        <p className="text-text-muted text-center py-12">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-text-muted text-center py-12">No posts yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </>
  );
}
