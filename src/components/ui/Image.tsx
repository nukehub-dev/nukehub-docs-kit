import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  wrapperClassName?: string;
  aspect?: "square" | "video" | "portrait" | "auto";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  fit?: "cover" | "contain" | "fill" | "none";
  transparent?: boolean;
  fill?: boolean;
  wrapperStyle?: React.CSSProperties;
}

export function Image({
  src,
  alt,
  fallback,
  wrapperClassName,
  className,
  aspect = "auto",
  rounded = "lg",
  fit = "cover",
  transparent = false,
  fill = true,
  wrapperStyle,
  ...imgProps
}: ImageProps) {
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">(() =>
    !src ? "error" : "loading",
  );
  const imgRef = React.useRef<HTMLImageElement>(null);
  const initial = fallback?.charAt(0).toUpperCase() || alt?.charAt(0).toUpperCase() || "?";

  React.useLayoutEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) {
      if (img.naturalWidth > 0) {
        setStatus("loaded");
      } else {
        setStatus("error");
      }
    }
  }, [src]);

  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    auto: "",
  };

  const roundedClass = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        transparent ? "bg-transparent" : "bg-muted",
        fill ? aspectClass[aspect] : "h-auto w-full",
        !fill && status === "loading" && "min-h-[16rem]",
        roundedClass[rounded],
        wrapperClassName,
      )}
      style={wrapperStyle}
    >
      <AnimatePresence>
        {status === "loading" && (
          <motion.div
            key="shimmer"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute inset-0 z-10",
              "bg-gradient-to-r from-muted via-muted-foreground/10 to-muted",
              "bg-[length:200%_100%]",
              "animate-shimmer",
            )}
          />
        )}
      </AnimatePresence>

      {status !== "error" && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={imgProps.loading ?? "lazy"}
          decoding={imgProps.decoding ?? "async"}
          className={cn(
            fill ? "h-full w-full" : "h-auto w-full",
            `object-${fit}`,
            status === "loaded" ? "opacity-100" : "opacity-0",
            "transition-opacity duration-300",
            className,
          )}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          {...imgProps}
        />
      )}

      {status === "error" && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            transparent ? "bg-transparent" : "bg-muted",
          )}
        >
          <span className="select-none text-2xl font-bold text-foreground">{initial}</span>
        </div>
      )}
    </div>
  );
}
