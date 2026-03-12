export const dynamic = 'force-dynamic';

import { FeedHeader } from '@/components/FeedHeader';
import { FeedClient } from '@/components/FeedClient';

export default function FeedPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <FeedHeader />
      <FeedClient />
    </main>
  );
}
