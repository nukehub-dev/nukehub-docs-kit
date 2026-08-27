export type { SiteConfig } from "./lib/site";
export type { NavItem } from "./lib/nav";
export type { FooterLink, FooterColumn } from "./lib/footer";

export { cn } from "./lib/utils";
export { slugToHref, getCategory, getCategoryLabel } from "./lib/docs";
export {
  resolveTheme,
  getThemePreference,
  getResolvedTheme,
  setThemePreference,
  getAccentColor,
  setAccentColor,
  cycleTheme,
  watchSystemTheme,
  ACCENT_SWATCHES,
  updateFavicon,
  updateMetaThemeColor,
  initThemeAndAccent,
} from "./lib/theme";
export type { ThemePreference, ResolvedTheme, AccentColor, AccentSwatch } from "./lib/theme";

export { Logo } from "./components/ui/Logo";
export { GitHubIcon } from "./components/icons/GitHubIcon";

export { SITE } from "./data/site";
export { navItems } from "./data/nav";
export { footerColumns, footerLegal } from "./data/footer";

export { default as markdownNegotiation } from "./integrations/markdown-negotiation";
