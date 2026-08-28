import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  image?: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  searchPlaceholder?: string;
}

const GAP = 4;
const VIEWPORT_PAD = 8;

function computeDropdownPosition(
  anchorRect: DOMRect,
  panelRect: DOMRect,
): { left: number; top: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = anchorRect.left;
  let top = anchorRect.bottom + GAP;

  if (top + panelRect.height > vh - VIEWPORT_PAD) {
    top = anchorRect.top - panelRect.height - GAP;
  }

  if (left + panelRect.width > vw - VIEWPORT_PAD) {
    left = anchorRect.right - panelRect.width;
  }

  left = Math.max(VIEWPORT_PAD, Math.min(vw - panelRect.width - VIEWPORT_PAD, left));
  top = Math.max(VIEWPORT_PAD, Math.min(vh - panelRect.height - VIEWPORT_PAD, top));

  return { left, top };
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  className,
  triggerClassName,
  searchPlaceholder = "Search...",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [coords, setCoords] = React.useState({ left: 0, top: 0, width: 0 });
  const [positioned, setPositioned] = React.useState(false);
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const query = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, search]);

  const enabledOptions = React.useMemo(
    () => filteredOptions.filter((opt) => !opt.disabled),
    [filteredOptions],
  );

  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );

  const updatePosition = React.useCallback(() => {
    if (!buttonRef.current || !panelRef.current) return;
    const anchorRect = buttonRef.current.getBoundingClientRect();
    const panelRect = panelRef.current.getBoundingClientRect();
    const { left, top } = computeDropdownPosition(anchorRect, panelRect);
    setCoords({ left, top, width: anchorRect.width });
    setPositioned(true);
  }, []);

  React.useLayoutEffect(() => {
    if (!open) {
      queueMicrotask(() => setPositioned(false));
      return;
    }
    updatePosition();
  }, [open, updatePosition]);

  React.useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  React.useEffect(() => {
    if (open && highlightedIndex >= 0) {
      const option = panelRef.current?.querySelector(`[data-index="${highlightedIndex}"]`);
      option?.scrollIntoView({ block: "nearest" });
    }
  }, [open, highlightedIndex]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
    setSearch("");
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) {
          setOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((prev) => (prev >= enabledOptions.length - 1 ? 0 : prev + 1));
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) {
          setOpen(true);
          setHighlightedIndex(enabledOptions.length - 1);
        } else {
          setHighlightedIndex((prev) => (prev <= 0 ? enabledOptions.length - 1 : prev - 1));
        }
        break;
      case "Enter":
        event.preventDefault();
        if (!open) {
          setOpen(true);
        } else if (highlightedIndex >= 0) {
          handleSelect(enabledOptions[highlightedIndex].value);
        }
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        if (open) setOpen(false);
        break;
    }
  };

  const panel = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[9999] overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
          style={{
            left: coords.left,
            top: coords.top,
            width: coords.width,
            opacity: positioned ? 1 : 0,
          }}
        >
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div className="max-h-60 space-y-1 overflow-auto p-1.5">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">No results found</div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = value === option.value;
                const isHighlighted = highlightedIndex === index;
                const isDisabled = option.disabled;
                return (
                  <button
                    key={option.value}
                    type="button"
                    data-index={index}
                    disabled={isDisabled}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors",
                      isDisabled && "cursor-not-allowed opacity-50",
                      isHighlighted && "bg-accent text-accent-foreground",
                      !isHighlighted && !isSelected && "text-foreground hover:bg-accent",
                      isSelected && !isHighlighted && "bg-primary/10 text-primary",
                    )}
                  >
                    <Check
                      className={cn("h-4 w-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")}
                    />
                    <span className="flex flex-1 items-center gap-2 truncate text-left">
                      {option.image && (
                        <img
                          src={option.image}
                          alt=""
                          className="h-5 w-5 shrink-0 rounded-full object-cover"
                        />
                      )}
                      <span className="truncate">{option.label}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          setOpen((o) => !o);
          if (!open) setSearch("");
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-input/80 px-3 py-1 text-sm shadow-sm backdrop-blur-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "ring-[3px] ring-ring/50",
          !value && "text-muted-foreground",
          triggerClassName,
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.image && (
            <img src={selectedOption.image} alt="" className="h-5 w-5 rounded-full object-cover" />
          )}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {mounted && createPortal(panel, document.body)}
    </div>
  );
}
