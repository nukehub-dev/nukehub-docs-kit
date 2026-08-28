import * as React from "react";
import { cn } from "../../lib/utils";

export type BadgeVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
  secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline:
    "border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
  ghost: "border-transparent bg-transparent text-muted-foreground hover:text-foreground",
  destructive: "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
