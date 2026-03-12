interface Alternative {
  option: string;
  reason_rejected: string;
}

interface StructuredFieldsProps {
  reasoning?: string;
  alternatives?: Alternative[];
  confidence?: string;
  context?: string;
}

export function StructuredFields({ reasoning, alternatives, confidence, context }: StructuredFieldsProps) {
  if (!reasoning && !context && !confidence) return null;

  return (
    <div className="space-y-3 mt-4 pt-4 border-t border-bg-border/50">
      {context && (
        <Field label="Context">
          <p className="font-mono text-sm text-text/80">{context}</p>
        </Field>
      )}
      {reasoning && (
        <Field label="Reasoning">
          <p className="font-mono text-sm text-text/80">{reasoning}</p>
        </Field>
      )}
      {confidence && (
        <Field label="Confidence">
          <ConfidenceBadge level={confidence} />
        </Field>
      )}
      {alternatives && alternatives.length > 0 && (
        <Field label="Alternatives considered">
          <ul className="space-y-1.5">
            {alternatives.map((alt) => (
              <li key={alt.option} className="font-mono text-sm text-text/70">
                <span className="text-text/90">{alt.option}</span>
                <span className="text-text-muted"> — {alt.reason_rejected}</span>
              </li>
            ))}
          </ul>
        </Field>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-xs text-text-muted uppercase tracking-wider">{label}</span>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ConfidenceBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    low: 'text-red-400 bg-red-400/10',
    medium: 'text-human bg-human/10',
    high: 'text-green-400 bg-green-400/10',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium
      ${colors[level] ?? 'text-text-muted bg-white/5'}`}>
      {level}
    </span>
  );
}
