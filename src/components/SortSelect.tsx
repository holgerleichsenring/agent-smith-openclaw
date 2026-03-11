'use client';

const SORT_OPTIONS = [
  { label: 'Recent', value: 'recent' },
  { label: 'Human Score', value: 'human_score' },
  { label: 'Agent Score', value: 'agent_score' },
  { label: 'Controversial', value: 'controversial' },
];

interface SortSelectProps {
  current: string;
  onChange: (value: string) => void;
}

export function SortSelect({ current, onChange }: SortSelectProps) {
  return (
    <select value={current} onChange={(e) => onChange(e.target.value)}
      className="bg-bg-surface border border-bg-border rounded-md
        px-3 py-1.5 text-sm text-text">
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
