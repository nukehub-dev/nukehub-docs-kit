import * as React from "react";
import { Check, ChevronDown, Copy } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Tooltip } from "../../ui/Tooltip";
import type { CopyFormat } from "../../../lib/citations";

interface CopyButtonProps {
  /** Formats offered by the menu; the first is the one-click default. */
  formats: CopyFormat[];
  label?: string;
  className?: string;
}

export function CopyButton({ formats, label = "Copy citation", className }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard errors.
    }
  };

  const handleDefaultClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await copy(formats[0].text);
  };

  React.useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector("button")?.focus();
    const handleMouseDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      toggleRef.current?.focus();
    }
  };

  const selectFormat = async (format: CopyFormat) => {
    await copy(format.text);
    setOpen(false);
  };

  const showMenu = formats.length > 1;

  return (
    <div ref={wrapperRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={handleDefaultClick}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium",
          "text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          showMenu ? "rounded-l-md" : "rounded-md",
        )}
        aria-label={copied ? "Copied" : label}
        aria-live="polite"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>
      {showMenu && (
        <Tooltip content="Copy formats">
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className={cn(
              "inline-flex items-center rounded-r-md border-l border-border/60 px-1 py-1",
              "text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            )}
            aria-label="Choose citation format"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
          </button>
        </Tooltip>
      )}
      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Citation formats"
          className="absolute right-0 top-full z-50 mt-1 min-w-36 overflow-hidden rounded-lg border border-border/80 bg-popover py-1 shadow-xl"
        >
          {formats.map((format) => (
            <button
              key={format.id}
              type="button"
              role="menuitem"
              onClick={() => selectFormat(format)}
              onKeyDown={handleMenuKeyDown}
              className={cn(
                "block w-full px-3 py-1.5 text-left text-xs font-medium text-popover-foreground",
                "transition-colors hover:bg-accent hover:text-accent-foreground",
                "focus-visible:bg-accent focus-visible:outline-none",
              )}
            >
              {format.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
