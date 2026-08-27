import { cn } from "../../lib/utils";

interface OdyseeProps {
  url?: string;
  claimName?: string;
  claimId?: string;
  title?: string;
  className?: string;
}

export function Odysee({
  url,
  claimName,
  claimId,
  title = "Odysee video",
  className,
}: OdyseeProps) {
  let src = url;
  if (!src && claimName && claimId) {
    src = `https://odysee.com/$/embed/${encodeURIComponent(claimName)}/${encodeURIComponent(claimId)}`;
  }

  if (!src) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border/50 bg-muted p-4 text-sm text-muted-foreground",
          className,
        )}
      >
        Missing Odysee video URL or claimName + claimId.
      </div>
    );
  }

  return (
    <figure className={cn("my-6", className)}>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/50 bg-muted shadow-sm">
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <figcaption className="mt-2 text-center text-xs text-muted-foreground">{title}</figcaption>
    </figure>
  );
}
