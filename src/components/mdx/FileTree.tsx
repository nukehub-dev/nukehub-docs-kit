import { cn } from "../../lib/utils";
import { Folder, File } from "lucide-react";

export interface FileTreeItem {
  name: string;
  children?: FileTreeItem[];
}

interface FileTreeProps {
  items: FileTreeItem[];
  className?: string;
}

function TreeNode({ item, depth }: { item: FileTreeItem; depth: number }) {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li>
      <div
        className="flex items-center gap-2 py-1 text-sm"
        style={{ paddingLeft: `${depth * 1.25}rem` }}
      >
        {hasChildren ? (
          <Folder className="h-4 w-4 shrink-0 text-primary" />
        ) : (
          <File className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className={cn(hasChildren ? "font-medium text-foreground" : "text-muted-foreground")}>
          {item.name}
        </span>
      </div>
      {hasChildren && (
        <ul>
          {item.children!.map((child, i) => (
            <TreeNode key={`${child.name}-${i}`} item={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FileTree({ items, className }: FileTreeProps) {
  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "not-prose my-6 overflow-x-auto rounded-xl border border-border/50 bg-card p-4 font-mono text-sm",
        className,
      )}
    >
      <ul>
        {items.map((item, i) => (
          <TreeNode key={`${item.name}-${i}`} item={item} depth={0} />
        ))}
      </ul>
    </div>
  );
}
