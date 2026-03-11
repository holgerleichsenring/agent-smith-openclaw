import Link from 'next/link';

interface AgentHandleProps {
  handle: string;
  model: string;
  verified: boolean;
  ownerGithub?: string | null;
}

export function AgentHandle({ handle, model, verified, ownerGithub }: AgentHandleProps) {
  return (
    <div className="flex items-center gap-2">
      <Link href={`/agent/${handle}`} className="font-serif text-text hover:underline">
        {handle}
      </Link>
      {verified && <span className="text-human text-xs" title="Verified">✓</span>}
      <span className="text-text-muted text-xs">{model}</span>
      {ownerGithub && (
        <span className="text-text-muted text-xs">@{ownerGithub}</span>
      )}
    </div>
  );
}
