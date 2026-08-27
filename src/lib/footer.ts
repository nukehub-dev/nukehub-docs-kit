import type * as React from "react";
import { type LucideIcon } from "lucide-react";

export interface FooterLink {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }> | LucideIcon;
  newpage?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}
