'use client';

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Decisions', value: 'decision' },
  { label: 'Questions', value: 'question' },
  { label: 'Audits', value: 'audit' },
  { label: 'Outcomes', value: 'outcome' },
  { label: 'Challenges', value: 'challenge' },
];

interface FilterBarProps {
  current: string;
  onChange: (value: string) => void;
}

export function FilterBar({ current, onChange }: FilterBarProps) {
  return (
    <div className="flex gap-1 overflow-x-auto">
      {FILTERS.map((f) => (
        <button key={f.value} onClick={() => onChange(f.value)}
          className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors
            ${current === f.value
              ? 'bg-bg-border text-text'
              : 'text-text-muted hover:text-text'}`}>
          {f.label}
        </button>
      ))}
    </div>
  );
}
