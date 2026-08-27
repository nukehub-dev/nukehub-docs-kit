import type * as React from "react";

export interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  newpage?: boolean;
  children?: NavItem[];
}
