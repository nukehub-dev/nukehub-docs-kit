import { useEffect, useCallback, useState } from "react";
import { cn } from "../../lib/utils";
import { getCategoryLabel, type SidebarNode, type SidebarSection } from "../../lib/docs";
import { ChevronRight, Folder, FolderOpen, FileText } from "lucide-react";

interface SidebarProps {
  sections: SidebarSection[];
  currentSlug: string;
  base: string;
}

function slugToHref(base: string, slug: string): string {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const clean = slug.replace(/^\//, "").replace(/\/index$/, "");
  if (!clean || clean === "index") return normalizedBase;
  return `${normalizedBase}${clean}/`;
}

function isActiveSubtree(nodes: SidebarNode[], currentSlug: string): boolean {
  for (const node of nodes) {
    if (node.slug === currentSlug) return true;
    if (node.children && isActiveSubtree(node.children, currentSlug)) return true;
  }
  return false;
}

interface TreeItemProps {
  node: SidebarNode;
  currentSlug: string;
  base: string;
  onNavigate: () => void;
}

function TreeItem({ node, currentSlug, base, onNavigate }: TreeItemProps) {
  const hasChildren = node.children && node.children.length > 0;
  const active = node.slug === currentSlug;
  const expanded = hasChildren
    ? active || isActiveSubtree(node.children ?? [], currentSlug)
    : false;
  const [open, setOpen] = useState(expanded);

  useEffect(() => {
    if (expanded) setOpen(true);
  }, [expanded]);

  const isGroup = Boolean(hasChildren);
  const icon = isGroup ? (
    open ? (
      <FolderOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    ) : (
      <Folder className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    )
  ) : (
    <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
  );

  const label = (
    <>
      {icon}
      <span className="truncate">{node.title}</span>
      {isGroup && node.count ? (
        <span
          className={cn(
            "ml-auto shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
            active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          {node.count}
        </span>
      ) : null}
    </>
  );

  return (
    <li>
      <div className="flex items-center">
        {isGroup ? (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
              "mr-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              open && "rotate-90",
            )}
            aria-label={open ? "Collapse section" : "Expand section"}
            aria-expanded={open}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span className="mr-1 h-5 w-5 shrink-0" />
        )}

        {node.slug ? (
          <a
            href={slugToHref(base, node.slug)}
            onClick={() => {
              if (isGroup) setOpen(true);
              onNavigate();
            }}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
              active
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {label}
          </a>
        ) : (
          <span
            onClick={() => isGroup && setOpen(!open)}
            className={cn(
              "flex min-w-0 flex-1 cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium",
              isGroup
                ? "cursor-pointer text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                : "text-foreground",
            )}
          >
            {label}
          </span>
        )}
      </div>

      {isGroup && open && (
        <ul className="ml-2.5 mt-0.5 space-y-0.5 border-l border-border/40 pl-3.5">
          {node.children!.map((child) => (
            <TreeItem
              key={child.slug || child.title}
              node={child}
              currentSlug={currentSlug}
              base={base}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function Sidebar({ sections, currentSlug, base }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = useCallback(() => setMobileOpen((open) => !open), []);

  useEffect(() => {
    const handleToggle = () => toggle();
    document.addEventListener("sidebar:toggle", handleToggle);
    return () => document.removeEventListener("sidebar:toggle", handleToggle);
  }, [toggle]);

  return (
    <>
      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        id="docs-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-[70] w-72 -translate-x-full transform overflow-x-hidden overflow-y-auto border-r border-border/50 bg-background px-5 py-6 transition-transform duration-200 lg:sticky lg:top-14 lg:z-auto lg:h-[calc(100dvh-3.5rem)] lg:w-80 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="pr-2">
          <nav className="space-y-6">
            {sections.map((section) => (
              <div key={section.category}>
                <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {getCategoryLabel(section.category)}
                </h3>
                <ul className="space-y-0.5">
                  {section.items.map((item) => (
                    <TreeItem
                      key={item.slug || item.title}
                      node={item}
                      currentSlug={currentSlug}
                      base={base}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
