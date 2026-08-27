# nukehub-docs-kit

Shared components, layouts, shortcodes, theme, and build tooling for NukeHub documentation sites.

## What it provides

- **Astro layouts**: `BaseLayout`, `DocLayout`
- **React components**: header, footer, sidebar, command palette, theme toggle, search, scroll progress, context menu, lightbox
- **MDX shortcodes**: `Callout`, `Tabs`, `TabItem`, `FileTree`, `Mermaid`, `Steps`, `Step`, `YouTube`, `Odysee`, `ImageFigure`, `DataTable`
- **Theme**: Tailwind CSS v4 tokens, dark/light/system mode, accent-color picker, and global styles. The favicon and theme-color meta tag follow the selected accent.
- **Utilities**: `cn`, sidebar/pagination helpers, theme helpers
- **Build integration**: `markdownNegotiation` emits a Markdown sibling for every HTML page
- **Sync CLI**: `nukehub-sync-docs` copies and cleans docs from `../docs/` into `src/content/docs/`

## Install

```bash
npm install nukehub-docs-kit
```

## Quick start

1. Create a fresh Astro project or use the `docs-template` repo as a starting point.
2. Add project-specific files:

   ```text
   src/
   ├── content.config.ts
   ├── data/
   │   ├── site.ts
   │   ├── nav.ts
   │   └── footer.ts
   ├── env.d.ts
   └── pages/
       ├── [...slug].astro
       └── 404.astro
   ```

3. Import layouts from the kit:

   ```astro
   ---
   import DocLayout from "nukehub-docs-kit/components/layout/DocLayout.astro";
   import BaseLayout from "nukehub-docs-kit/components/layout/BaseLayout.astro";
   ---
   ```

   Pass your `site`, `navItems`, `footerColumns`, and `footerLegal` as props to `DocLayout` and `BaseLayout`.

4. Add `astro.config.mjs` using the kit's `markdownNegotiation` integration and `@tailwindcss/vite`.
5. Add docs under `docs/` and run `npx nukehub-sync-docs`.

## Updating the kit

When the kit improves, pull the latest version in any consuming project:

```bash
npm update nukehub-docs-kit
```

No need to copy files or cherry-pick template changes.

## See also

- [`docs-template`](https://github.com/nukehub-dev/docs-template) — reference consumer of this kit.
