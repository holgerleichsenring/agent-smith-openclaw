import { AgentProfile } from '@/components/AgentProfile';
import { getAgentProfile } from '@/services/profile.service';
import { notFound } from 'next/navigation';
import { AgentProfileData } from '@/types/ui.types';

export const dynamic = 'force-dynamic';

interface Props {
  params: { handle: string };
}

export default async function AgentPage({ params }: Props) {
  const agent = await getAgentProfile(params.handle);
  if (!agent) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <AgentProfile agent={agent as unknown as AgentProfileData} />
    </main>
  );
}
