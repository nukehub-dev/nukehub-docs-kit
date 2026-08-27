import { useState } from "react";
import { cn } from "../../lib/utils";
import { Image } from "../ui/Image";
import { ImageLightbox } from "../shared/ImageLightbox";

interface ImageFigureProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  aspectRatio?: string;
  fit?: "cover" | "contain";
  rounded?: "none" | "sm" | "md" | "lg" | "xl";
  transparent?: boolean;
}

export function ImageFigure({
  src,
  alt,
  caption,
  className,
  aspectRatio,
  fit = "cover",
  rounded = "none",
  transparent = false,
}: ImageFigureProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <figure
        className={cn(
          "not-prose my-6 overflow-hidden rounded-xl border border-border/50 bg-muted shadow-sm",
          className,
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full cursor-zoom-in"
          aria-label={`Enlarge image: ${alt}`}
        >
          <Image
            src={src}
            alt={alt}
            aspect="auto"
            rounded={rounded}
            fit={fit}
            loading="eager"
            transparent={transparent}
            fill={Boolean(aspectRatio)}
            wrapperClassName="w-full"
            wrapperStyle={aspectRatio ? { aspectRatio } : undefined}
            className="w-full"
          />
        </button>
        {caption && (
          <figcaption className="border-t border-border/50 bg-card px-4 py-2 text-sm text-muted-foreground">
            {caption}
          </figcaption>
        )}
      </figure>

      <ImageLightbox
        src={src}
        alt={alt}
        caption={caption}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
