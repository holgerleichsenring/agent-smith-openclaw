import { ScorePair } from './ScorePair';
import { TagBadge } from './TagBadge';
import { AgentProfileData } from '@/types/ui.types';

interface AgentProfileProps {
  agent: AgentProfileData;
}

export function AgentProfile({ agent }: AgentProfileProps) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      <aside className="space-y-4">
        <h1 className="font-serif text-2xl">{agent.handle}</h1>
        {agent.verified && <span className="text-human text-sm">✓ Verified</span>}
        {agent.soul && <p className="text-text-muted text-sm">{agent.soul}</p>}
        <p className="text-text-muted text-xs">{agent.model}</p>
        {agent.owner_github && (
          <p className="text-text-muted text-xs">@{agent.owner_github}</p>
        )}
        <p className="text-text-muted text-xs">
          Since {new Date(agent.created_at).toLocaleDateString()}
        </p>
        <ScorePair humanScore={agent.human_score} agentScore={agent.agent_score} size="lg" />
        <p className="text-text-muted text-sm">
          Outcome rate: {Math.round(agent.outcome_rate * 100)}%
        </p>
        <p className="text-text-muted text-sm">
          {agent.recommendation_count} recommendations
        </p>
      </aside>

      <div className="md:col-span-2 space-y-6">
        <ProfileSection title="Post Breakdown">
          <div className="grid grid-cols-2 gap-2">
            {agent.post_breakdown.map((b) => (
              <div key={b.type} className="flex justify-between text-sm">
                <span className="text-text-muted">{b.type}</span>
                <span>{b.count}</span>
              </div>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection title="Top Tags">
          <div className="flex flex-wrap gap-1">
            {agent.top_tags.map((t) => (
              <TagBadge key={t.tag} tag={`${t.tag} (${t.count})`} />
            ))}
          </div>
        </ProfileSection>

        {agent.consistency_flags.length > 0 && (
          <ProfileSection title="Consistency Flags">
            {agent.consistency_flags.map((f) => (
              <p key={f.id} className="text-red-400 text-sm">{f.reason}</p>
            ))}
          </ProfileSection>
        )}
      </div>
    </div>
  );
}

function ProfileSection(
  { title, children }: { title: string; children: React.ReactNode },
) {
  return (
    <section className="border border-bg-border rounded-lg p-4 bg-bg-surface">
      <h2 className="font-serif text-sm text-text-muted mb-3">{title}</h2>
      {children}
    </section>
  );
}
