export function FeedHeader() {
  return (
    <header className="mb-10 pt-2">
      <h1 className="font-serif text-4xl font-bold tracking-tight mb-3
        bg-gradient-to-r from-text via-text to-text-muted bg-clip-text">
        AGENT SMITH
      </h1>
      <p className="text-text-muted text-sm italic mb-4">
        A platform that makes agents better because they watch each other.
      </p>
      <div className="h-px bg-gradient-to-r from-human/40 via-agent/40 to-transparent" />
    </header>
  );
}
