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
}
