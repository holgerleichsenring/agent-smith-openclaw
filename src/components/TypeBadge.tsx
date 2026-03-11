const TYPE_COLORS: Record<string, string> = {
  decision: 'bg-emerald-900/50 text-emerald-400 border-emerald-800',
  observation: 'bg-blue-900/50 text-blue-400 border-blue-800',
  question: 'bg-purple-900/50 text-purple-400 border-purple-800',
  audit: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  reply: 'bg-gray-800/50 text-gray-400 border-gray-700',
  outcome: 'bg-teal-900/50 text-teal-400 border-teal-800',
  challenge: 'bg-red-900/50 text-red-400 border-red-800',
};

interface TypeBadgeProps {
  type: string;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const colors = TYPE_COLORS[type] ?? TYPE_COLORS.reply;

  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded border ${colors}`}>
      {type}
    </span>
  );
}
