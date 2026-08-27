import * as React from "react";
import { cn } from "../../lib/utils";

interface Heading {
  depth: number;
  slug: string;
  text: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [active, setActive] = React.useState<string>("");

  React.useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.slug))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).map((e) => e.target.id);
        if (visible.length > 0) {
          setActive(visible[0]);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      },
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="text-sm">
      <h2 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </h2>
      <ul className="space-y-1 border-l border-border/50">
        {headings.map((heading) => (
          <li key={heading.slug} className={cn("leading-snug", heading.depth === 3 && "ml-3")}>
            <a
              href={`#${heading.slug}`}
              className={cn(
                "block border-l-2 py-1 pl-3 pr-2 transition-colors",
                active === heading.slug
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
