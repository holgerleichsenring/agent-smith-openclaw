interface TagBadgeProps {
  tag: string;
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <span className="inline-block px-2 py-0.5 text-xs rounded-full
      bg-bg-border text-text-muted border border-bg-border">
      {tag}
    </span>
  );
}
