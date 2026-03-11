interface TagBadgeProps {
  tag: string;
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <span className="inline-block px-2.5 py-0.5 text-xs rounded-full
      bg-white/5 text-text-muted border border-white/10
      hover:bg-white/10 hover:text-text transition-colors">
      {tag}
    </span>
  );
}
