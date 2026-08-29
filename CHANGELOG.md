# Changelog

All notable changes to `@nukehub/docs-kit` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.1] - 2026-08-30

### Added

- `SiteConfig` now accepts an optional `faviconPaths` field. Consumers can pass custom SVG path data for the dynamic theme-aware favicon; the kit tints it with the current `--primary` color. Omitting the field keeps the default NukeHub logo.
- Citation support: `<Citation id="..." />` shortcode and an auto-rendered `References` bibliography. References are declared in page frontmatter and passed to `DocLayout` via the new `references` prop. Each bibliography entry offers copy-to-clipboard exports in plain text, BibTeX, and RIS. The reference schema supports academic fields including `doi`, `arxiv`, `journal`, `volume`, `issue`, and `pages`.

## [0.3.0] - 2026-08-30

### Added

- New UI primitives: `Combobox`, `MultiSelect`, `Slider`, `SearchInput`, `Badge`, `Skeleton`, `Calendar`, `TimePicker`, `DateRangePicker`, `Modal`, `Dialog`, `ConfirmDialog`, `Toast`, and `Toaster`.

### Fixed

- Sidebar folder badge count now excludes a folder's own index page when the folder has child pages, so counts match the visible child pages.
- Root-level docs pages (for example `docs/ui-showcase.mdx`) now appear as a sibling link in the sidebar instead of becoming an empty category.
- `Slider` thumb is now a solid filled knob with a cleaner focus ring.
- `MultiSelect` selected chips no longer wrap their remove icon onto a separate line during SSR or in narrow containers.

## [0.2.2] - 2026-08-28

### Fixed

- Shiki dual-theme CSS keeps Shiki's default light-mode background for readable token contrast; dark mode switches the container and token spans to `--shiki-dark-bg` / `--shiki-dark`, preserving per-token colors.

## [0.2.1] - 2026-08-28

### Fixed

- Shiki dual-theme CSS no longer overrides per-token span colors, restoring syntax highlighting in dark mode and preserving Shiki highlight backgrounds.

## [0.2.0] - 2026-08-28

### Added

- Opt-in MDX shortcodes `Plotly` and `Model3D` for interactive charts and 3D models.
- `DocLayout` now accepts an `mdxComponents` prop so consumers can opt into `Plotly`, `Model3D`, or future shortcodes without forcing heavy dependencies on every site.
- `plotly.js-dist-min` and `three` as optional peer dependencies (also added as dev dependencies for local development and symlinked installs).
- CSS support for Shiki dual themes, switching code block colors based on the `data-theme` attribute.
- Light-mode code blocks now use the `--card` surface instead of Shiki's default stark white.

## [0.1.0] - 2026-08-28

### Added

- Initial release of `@nukehub/docs-kit`.
- Astro layouts: `BaseLayout`, `DocLayout`.
- Docs components: `TableOfContents`, `Pagination`, `EditLink`, `NotFound`.
- React components: header, footer, sidebar, command palette, theme toggle, search, scroll progress, context menu, lightbox.
- MDX shortcodes: `Callout`, `Tabs`, `TabItem`, `FileTree`, `Mermaid`, `Steps`, `Step`, `YouTube`, `Odysee`, `ImageFigure`, `DataTable`.
- Tailwind CSS v4 theme tokens, dark/light/system mode, and accent-color picker.
- `markdownNegotiation` Astro integration for Markdown sibling generation.
- `nukehub-sync-docs` CLI for syncing a `docs/` tree into `src/content/docs/`.
