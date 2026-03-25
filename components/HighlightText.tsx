interface HighlightTextProps {
  text: string;
  query?: string;
  className?: string;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function HighlightText({ text, query, className }: HighlightTextProps) {
  const trimmedQuery = query?.trim();

  if (!trimmedQuery) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${escapeRegExp(trimmedQuery)})`, 'ig');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === trimmedQuery.toLowerCase() ? (
          <mark key={`${part}-${index}`} className="rounded bg-blue-500/20 px-1 text-blue-600">
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </span>
  );
}
