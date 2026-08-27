import * as React from "react";
import { cn } from "../../lib/utils";

interface StepProps {
  children: React.ReactNode;
  className?: string;
}

export function Step({ children, className }: StepProps) {
  return (
    <li
      className={cn(
        "relative flex gap-4 pb-8 last:pb-0",
        "before:flex before:h-8 before:w-8 before:shrink-0 before:items-center before:justify-center before:rounded-full before:border before:border-primary/30 before:bg-primary/10 before:text-sm before:font-semibold before:text-primary before:content-[counter(nuke-step)] before:[counter-increment:nuke-step]",
        "after:absolute after:bottom-0 after:left-4 after:top-8 after:w-px after:bg-border/70 last:after:hidden",
        className,
      )}
    >
      <div className="min-w-0 flex-1 pt-0.5 leading-7">{children}</div>
    </li>
  );
}

interface StepsProps {
  children: React.ReactNode;
  className?: string;
}

export function Steps({ children, className }: StepsProps) {
  return <ol className={cn("not-prose my-6 [counter-reset:nuke-step]", className)}>{children}</ol>;
}
