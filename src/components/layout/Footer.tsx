import type { SiteConfig } from "../../lib/site";
import type { FooterColumn, FooterLink } from "../../lib/footer";
import { GitHubIcon } from "../icons/GitHubIcon";
import { ArrowUpRight } from "lucide-react";

interface FooterProps {
  base: string;
  site: SiteConfig;
  footerColumns: FooterColumn[];
  footerLegal: FooterLink[];
}

function normalizeHref(base: string, url: string) {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return url.startsWith("/") ? `${normalizedBase}${url.slice(1)}` : url;
}

export function Footer({ base, site, footerColumns, footerLegal }: FooterProps) {
  const year = new Date().getFullYear();
  const Logo = site.logo;

  return (
    <footer className="relative mt-auto w-full border-t border-border/40 bg-background">
      <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-10 lg:flex-row">
          {/* Brand */}
          <div className="max-w-xs">
            <a
              href={base}
              className="inline-flex items-center gap-2 text-lg font-semibold text-foreground transition-opacity hover:opacity-80"
            >
              <Logo size={22} className="text-primary" />
              <span>{site.logoText}</span>
            </a>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{site.description}</p>
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="GitHub"
            >
              <GitHubIcon className="h-[18px] w-[18px]" />
            </a>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-8 sm:gap-12">
            {footerColumns.map((col) => (
              <div key={col.title} className="min-w-[120px]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  {col.title}
                </h3>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => {
                    const Icon = link.icon;
                    const href = link.newpage ? link.url : normalizeHref(base, link.url);
                    return (
                      <li key={link.title}>
                        <a
                          href={href}
                          target={link.newpage ? "_blank" : undefined}
                          rel={link.newpage ? "noopener noreferrer" : undefined}
                          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {Icon && <Icon size={14} className="opacity-70" />}
                          <span>{link.title}</span>
                          {link.newpage && (
                            <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {year} NukeHub. All rights reserved.</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {footerLegal.map((link) => {
              const href = link.newpage ? link.url : normalizeHref(base, link.url);
              return (
                <a
                  key={link.url}
                  href={href}
                  target={link.newpage ? "_blank" : undefined}
                  rel={link.newpage ? "noopener noreferrer" : undefined}
                  className="transition-colors hover:text-foreground"
                >
                  {link.title}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </footer>
  );
}
