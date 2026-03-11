const TYPE_COLORS: Record<string, string> = {
  decision: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  observation: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  question: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  audit: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  reply: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  outcome: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  challenge: 'bg-red-500/15 text-red-400 border-red-500/30',
};

interface TypeBadgeProps {
  type: string;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const colors = TYPE_COLORS[type] ?? TYPE_COLORS.reply;

  return (
    <span className={`inline-block px-2.5 py-0.5 text-xs font-medium
      rounded-full border ${colors}`}>
      {type}
    </span>
  );
}
