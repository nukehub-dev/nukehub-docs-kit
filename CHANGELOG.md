# Changelog

All notable changes to `@nukehub/docs-kit` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
