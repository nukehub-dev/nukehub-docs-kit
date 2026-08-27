import * as React from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { ArrowUp, ArrowDown, ArrowUpDown, Search, Download } from "lucide-react";

interface Column<T extends Record<string, React.ReactNode>> {
  key: keyof T;
  header: React.ReactNode;
  align?: "left" | "right" | "center";
  sortable?: boolean;
}

interface DataTableProps<T extends Record<string, React.ReactNode>> {
  columns: Column<T>[];
  data: T[];
  caption?: React.ReactNode;
  className?: string;
  sortable?: boolean;
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  exportable?: boolean;
}

function escapeCsv(value: string): string {
  const safe = value.replace(/"/g, '""');
  if (/[",\n\r]/.test(safe)) return `"${safe}"`;
  return safe;
}

function cellText(value: React.ReactNode): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return "";
}

function rowText<T extends Record<string, React.ReactNode>>(row: T): string {
  return Object.values(row).map(cellText).join(" ").toLowerCase();
}

function sortValue(a: React.ReactNode, b: React.ReactNode): number {
  const ta = typeof a === "number" ? a : cellText(a);
  const tb = typeof b === "number" ? b : cellText(b);

  if (typeof ta === "number" && typeof tb === "number") {
    return ta - tb;
  }

  return String(ta).localeCompare(String(tb), undefined, { numeric: true });
}

export function DataTable<T extends Record<string, React.ReactNode>>({
  columns,
  data,
  caption,
  className,
  sortable: globallySortable = false,
  searchable = false,
  pagination = false,
  pageSize = 15,
  exportable = false,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<keyof T | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return data;
    return data.filter((row) => rowText(row).includes(term));
  }, [data, query]);

  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered;
    const next = [...filtered];
    next.sort((a, b) => {
      const result = sortValue(a[sortKey], b[sortKey]);
      return sortDir === "asc" ? result : -result;
    });
    return next;
  }, [filtered, sortKey, sortDir]);

  const totalPages = pagination ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const safePage = Math.min(page, totalPages);
  const pageRows = pagination
    ? sorted.slice((safePage - 1) * pageSize, safePage * pageSize)
    : sorted;

  const handleSort = (key: keyof T, columnSortable?: boolean) => {
    const enabled = columnSortable !== false && (globallySortable || columnSortable === true);
    if (!enabled) return;

    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const startRow = sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endRow = Math.min(safePage * pageSize, sorted.length);

  const handleExport = () => {
    if (typeof window === "undefined") return;

    const headers = columns.map((col) => cellText(col.header));
    const rows = sorted.map((row) =>
      columns.map((col) => escapeCsv(cellText(row[col.key]))).join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const showToolbar = searchable || exportable;

  return (
    <div className={cn("not-prose space-y-3", className)}>
      {showToolbar && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {searchable && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search table…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
                aria-label="Search table"
              />
            </div>
          )}
          {exportable && (
            <Button variant="outline" size="sm" onClick={handleExport} className="shrink-0">
              <Download className="mr-1.5 h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border/50 bg-card">
        <table className="w-full min-w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/50">
              {columns.map((col) => {
                const isSortable =
                  col.sortable !== false && (globallySortable || col.sortable === true);
                const active = sortKey === col.key;

                return (
                  <th
                    key={String(col.key)}
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-left font-semibold text-foreground",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      isSortable && "cursor-pointer select-none",
                    )}
                    onClick={() => handleSort(col.key, col.sortable)}
                    aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {isSortable && (
                        <span className="text-muted-foreground">
                          {active ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No matching rows.
                </td>
              </tr>
            ) : (
              pageRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border/50 last:border-b-0">
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn(
                        "px-4 py-3 text-muted-foreground",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.align === "left" && "text-left",
                      )}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          {caption && (
            <caption className="caption-bottom border-t border-border/50 px-4 py-3 text-left text-xs text-muted-foreground">
              {caption}
            </caption>
          )}
        </table>
      </div>

      {pagination && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Showing {startRow}–{endRow} of {sorted.length} result
            {sorted.length === 1 ? "" : "s"}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === safePage ? "default" : "outline"}
                size="sm"
                className="hidden min-w-[2.25rem] sm:inline-flex"
                onClick={() => setPage(p)}
                aria-current={p === safePage ? "page" : undefined}
              >
                {p}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
