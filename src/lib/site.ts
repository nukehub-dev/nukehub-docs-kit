import type { ComponentType } from "react";

export interface SiteConfig {
  name: string;
  logoText: string;
  description: string;
  site: string;
  base: string;
  github: string;
  editBranch: string;
  editPath: string;
  logo: ComponentType<{ className?: string; size?: number; color?: string }>;
  /**
   * Optional SVG path data for the dynamic theme-aware favicon. The string should
   * contain one or more SVG elements (e.g. `<path>`, `<circle>`) using
   * `fill="currentColor"` / `stroke="currentColor"` so the kit can tint it with the
   * current accent color. When omitted, the default NukeHub logo is used.
   */
  faviconPaths?: string;
}
