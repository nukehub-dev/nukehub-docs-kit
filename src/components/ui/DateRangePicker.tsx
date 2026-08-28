import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { Calendar } from "./Calendar";

export interface DateRange {
  from: string;
  to: string;
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const PRESETS = [
  {
    label: "Today",
    getRange: (): DateRange => {
      const d = new Date().toISOString().split("T")[0];
      return { from: d, to: d };
    },
  },
  {
    label: "Last 7d",
    getRange: (): DateRange => {
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 6);
      return {
        from: from.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
      };
    },
  },
  {
    label: "Last 30d",
    getRange: (): DateRange => {
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 29);
      return {
        from: from.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
      };
    },
  },
  {
    label: "Last 90d",
    getRange: (): DateRange => {
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 89);
      return {
        from: from.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
      };
    },
  },
  {
    label: "This Month",
    getRange: (): DateRange => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        from: from.toISOString().split("T")[0],
        to: now.toISOString().split("T")[0],
      };
    },
  },
  {
    label: "Last Month",
    getRange: (): DateRange => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        from: from.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
      };
    },
  },
];

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [showPresets, setShowPresets] = useState(false);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFromOpen(false);
        setToOpen(false);
        setShowPresets(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const daysCount = (() => {
    if (!value.from || !value.to) return 0;
    const from = new Date(value.from);
    const to = new Date(value.to);
    return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  })();

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="relative" ref={fromRef}>
        <button
          type="button"
          onClick={() => {
            setFromOpen((o) => !o);
            setToOpen(false);
          }}
          className={cn(
            "flex items-center gap-2 rounded-lg border py-1.5 pl-3 pr-3 text-sm transition-all",
            "bg-background text-foreground hover:bg-accent",
            fromOpen && "border-primary ring-1 ring-primary",
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className={cn(!value.from && "text-muted-foreground")}>
            {value.from ? formatDisplayDate(value.from) : "Start"}
          </span>
        </button>
        <Calendar
          value={value.from}
          onSelect={(date) => onChange({ ...value, from: date })}
          maxDate={value.to && value.to < today ? value.to : today}
          open={fromOpen}
          onClose={() => setFromOpen(false)}
          anchorRef={fromRef}
        />
      </div>

      <span className="text-sm text-muted-foreground">to</span>

      <div className="relative" ref={toRef}>
        <button
          type="button"
          onClick={() => {
            setToOpen((o) => !o);
            setFromOpen(false);
          }}
          className={cn(
            "flex items-center gap-2 rounded-lg border py-1.5 pl-3 pr-3 text-sm transition-all",
            "bg-background text-foreground hover:bg-accent",
            toOpen && "border-primary ring-1 ring-primary",
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className={cn(!value.to && "text-muted-foreground")}>
            {value.to ? formatDisplayDate(value.to) : "End"}
          </span>
        </button>
        <Calendar
          value={value.to}
          onSelect={(date) => onChange({ ...value, to: date })}
          minDate={value.from || undefined}
          maxDate={today}
          open={toOpen}
          onClose={() => setToOpen(false)}
          anchorRef={toRef}
        />
      </div>

      {value.from && value.to && (
        <span className="tabular-nums text-xs text-muted-foreground">{daysCount}d</span>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPresets((s) => !s)}
          className={cn(
            "flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors",
            "bg-background text-foreground hover:bg-accent",
            showPresets && "border-primary ring-1 ring-primary",
          )}
        >
          Quick Select
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform",
              showPresets && "rotate-180",
            )}
          />
        </button>
        {showPresets && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPresets(false)} />
            <div
              className="bubble absolute right-0 top-full z-50 mt-1 min-w-[160px] border p-1.5"
              style={{ borderColor: "var(--border)", borderWidth: "1px" }}
            >
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    onChange(preset.getRange());
                    setShowPresets(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
