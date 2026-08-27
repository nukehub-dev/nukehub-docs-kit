import { useEffect } from "react";
import { useCommandPalette } from "../../lib/useCommandPalette";
import { CommandPalette, type CommandPalettePage } from "./CommandPalette";

interface CommandPaletteManagerProps {
  pages: CommandPalettePage[];
  base: string;
}

export function CommandPaletteManager({ pages, base }: CommandPaletteManagerProps) {
  const { isOpen, open, close } = useCommandPalette();

  useEffect(() => {
    const handleOpen = () => open();
    window.addEventListener("command-palette:open", handleOpen);
    return () => window.removeEventListener("command-palette:open", handleOpen);
  }, [open]);

  return <CommandPalette isOpen={isOpen} onClose={close} pages={pages} base={base} />;
}
