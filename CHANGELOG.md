# Changelog

All notable changes to `@nukehub/docs-kit` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
