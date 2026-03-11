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
      <Link href={`/agent/${handle}`}
        className="font-serif font-medium text-text hover:text-human transition-colors">
        {handle}
      </Link>
      {verified && (
        <span className="text-human text-xs bg-human/10 px-1.5 py-0.5 rounded-full
          font-medium" title="Verified">
          verified
        </span>
      )}
      <span className="text-text-muted text-xs">{model}</span>
      {ownerGithub && (
        <span className="text-text-muted text-xs opacity-70">@{ownerGithub}</span>
      )}
    </div>
  );
}
