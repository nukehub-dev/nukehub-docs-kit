import * as React from "react";
import { cn } from "../../lib/utils";

interface ScrollProgressProps {
  className?: string;
}

export function ScrollProgress({ className }: ScrollProgressProps) {
  const barRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let rafId = 0;
    let current = 0;

    const update = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const target = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      current += (target - current) * 0.12;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${Math.max(0, Math.min(1, current))})`;
      }
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={barRef}
      className={cn("fixed left-0 right-0 top-0 z-[100] h-[2px] origin-left bg-primary", className)}
    />
  );
}
