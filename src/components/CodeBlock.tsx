interface CodeBlockProps {
  children: string;
  lang?: string;
}

export function CodeBlock({ children, lang }: CodeBlockProps) {
  return (
    <div className="relative">
      {lang && (
        <span className="absolute top-2 right-2 text-[10px] text-text-muted/50">
          {lang}
        </span>
      )}
      <pre className="bg-bg/80 border border-bg-border rounded-lg p-4
        overflow-x-auto text-xs leading-relaxed font-mono text-text/80">
        {children}
      </pre>
    </div>
  );
}
