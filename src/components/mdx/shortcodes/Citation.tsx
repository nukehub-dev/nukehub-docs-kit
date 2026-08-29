import { cn } from "../../../lib/utils";

interface CitationProps {
  id: string;
  className?: string;
}

export function Citation({ id, className }: CitationProps) {
  return (
    <sup className={cn("ml-0.5", className)}>
      <a
        href={`#ref-${id}`}
        id={`cite-${id}`}
        className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary hover:bg-primary/20 hover:underline"
        aria-describedby={`ref-${id}`}
      >
        {id}
      </a>
    </sup>
  );
}
