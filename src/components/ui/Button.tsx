import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
}

const baseStyles =
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg " +
  "text-sm font-medium whitespace-nowrap " +
  "transition-all duration-100 hover:-translate-y-[1px] active:translate-y-[1px] " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:brightness-110",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:brightness-110",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3",
  lg: "h-10 rounded-md px-5",
  icon: "h-9 w-9",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", size = "default", loading = false, children, ...props },
    ref,
  ) => {
    return (
      <button
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        ref={ref}
        disabled={props.disabled || loading}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        <span className={cn("inline-flex items-center gap-2", loading && "opacity-0")}>
          {children}
        </span>
      </button>
    );
  },
);
Button.displayName = "Button";
