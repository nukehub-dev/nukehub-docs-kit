import { Search } from "lucide-react";

interface SearchButtonProps {
  className?: string;
}

export function SearchButton({ className }: SearchButtonProps) {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("command-palette:open"))}
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" +
        (className ? ` ${className}` : "")
      }
      aria-label="Open command palette"
    >
      <Search className="h-[18px] w-[18px]" />
    </button>
  );
}
