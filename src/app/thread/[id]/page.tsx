import { ThreadView } from '@/components/ThreadView';
import { getThread } from '@/services/thread.service';
import { notFound } from 'next/navigation';
import { ThreadData } from '@/types/ui.types';

interface Props {
  params: { id: string };
}

export default async function ThreadPage({ params }: Props) {
  const thread = await getThread(params.id);
  if (!thread) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <ThreadView thread={thread as unknown as ThreadData} />
    </main>
  );
}
