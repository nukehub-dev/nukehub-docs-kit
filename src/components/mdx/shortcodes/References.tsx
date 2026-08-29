import { ExternalLink } from "lucide-react";
import { cn } from "../../../lib/utils";
import { buildCopyFormats } from "../../../lib/citations";
import type { Reference } from "../../../lib/citations";
import { CopyButton } from "./CopyButton";

interface ReferencesProps {
  references: Reference[];
  className?: string;
}

function ReferenceDetails({ ref }: { ref: Reference }) {
  const parts: string[] = [];

  if (ref.journal) {
    let detail = ref.journal;
    if (ref.volume) {
      detail += ` ${ref.volume}`;
      if (ref.issue) detail += `(${ref.issue})`;
    }
    if (ref.pages) detail += `, ${ref.pages}`;
    parts.push(detail);
  } else if (ref.source) {
    parts.push(ref.source);
  }

  if (ref.date) parts.push(`(${ref.date})`);

  return parts.length > 0 ? (
    <span className="ml-1 text-muted-foreground">— {parts.join(" ")}</span>
  ) : null;
}

export function References({ references, className }: ReferencesProps) {
  if (references.length === 0) return null;

  return (
    <section
      id="references"
      aria-labelledby="references-heading"
      className={cn("mt-12", className)}
    >
      <h2 id="references-heading" className="mb-4 text-2xl font-semibold tracking-tight">
        References
      </h2>
      <ol className="space-y-3">
        {references.map((ref) => (
          <li
            key={ref.id}
            id={`ref-${ref.id}`}
            className="scroll-mt-24 text-sm leading-relaxed text-muted-foreground"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-1 font-medium text-foreground hover:text-primary hover:underline"
                >
                  <span>[{ref.id}]</span>
                  <span>{ref.title}</span>
                  <ExternalLink
                    size={12}
                    className="mt-1 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </a>
                <ReferenceDetails ref={ref} />
                {(ref.doi || ref.arxiv) && (
                  <span className="ml-2 inline-flex flex-wrap gap-2">
                    {ref.doi && (
                      <a
                        href={`https://doi.org/${ref.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground hover:text-primary hover:underline"
                      >
                        DOI:{ref.doi}
                      </a>
                    )}
                    {ref.arxiv && (
                      <a
                        href={`https://arxiv.org/abs/${ref.arxiv}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground hover:text-primary hover:underline"
                      >
                        arXiv:{ref.arxiv}
                      </a>
                    )}
                  </span>
                )}
                <a
                  href={`#cite-${ref.id}`}
                  className="ml-2 text-xs text-primary hover:underline"
                  aria-label={`Back to citation ${ref.id}`}
                >
                  ↩
                </a>
              </div>
              <CopyButton
                formats={buildCopyFormats(ref)}
                label={`Copy citation for ${ref.id}`}
                className="shrink-0"
              />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
