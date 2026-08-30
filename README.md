# nukehub-docs-kit

Shared components, layouts, shortcodes, theme, and build tooling for NukeHub documentation sites.

## What it provides

- **Astro layouts**: `BaseLayout`, `DocLayout`
- **Docs components**: `TableOfContents`, `Pagination`, `EditLink`, `NotFound`
- **React components**: header, footer, sidebar, command palette, theme toggle, search, scroll progress, context menu, lightbox
- **UI primitives**: `Button`, `Input`, `Label`, `Textarea`, `Checkbox`, `RadioGroup`, `Select`, `Switch`, `Combobox`, `MultiSelect`, `Slider`, `TimePicker`, `Calendar`, `DateRangePicker`, `Modal`, `Dialog`, `ConfirmDialog`, `SearchInput`, `Badge`, `Skeleton`, `Toast`, `Toaster`
- **MDX shortcodes**: `Callout`, `Tabs`, `TabItem`, `FileTree`, `Mermaid`, `Steps`, `Step`, `YouTube`, `Odysee`, `ImageFigure`, `DataTable`, `Citation`
- **Opt-in interactive shortcodes**: `Plotly` and `Model3D` (requires installing `plotly.js-dist-min` and `three`, then passing the components to `DocLayout` via `mdxComponents`)
- **Theme**: Tailwind CSS v4 tokens, dark/light/system mode, accent-color picker, and global styles. The favicon and theme-color meta tag follow the selected accent.
- **Utilities**: `cn`, sidebar/pagination helpers, theme helpers
- **Build integration**: `markdownNegotiation` emits a Markdown sibling for every HTML page
- **Sync CLI**: `nukehub-sync-docs` copies and cleans docs from `../docs/` into `src/content/docs/`, rewriting Markdown links and injecting frontmatter (including `editPath`, the repo-relative source path used by `EditLink` — declare `editPath: z.string().optional()` in your docs collection schema)

## Install

```bash
npm install @nukehub/docs-kit
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
   import DocLayout from "@nukehub/docs-kit/components/layout/DocLayout.astro";
   import BaseLayout from "@nukehub/docs-kit/components/layout/BaseLayout.astro";
   ---
   ```

   Pass your `site`, `navItems`, `footerColumns`, and `footerLegal` as props to `DocLayout` and `BaseLayout`.

4. Add `astro.config.mjs` using the kit's `markdownNegotiation` integration and `@tailwindcss/vite`.
5. Add docs under `docs/` and run `npx nukehub-sync-docs`.

## Favicon

The kit generates a dynamic, theme-aware favicon so the tab icon matches the user's selected accent and resolved light/dark mode.

- Place a `favicon.svg` in your project's `public/` directory. It is used as the no-JS fallback.
- When JavaScript runs, the kit replaces it with a data-URI SVG colored from the current `--primary` CSS variable.
- The dynamic favicon uses the built-in NukeHub logo paths. To use a custom logo dynamically, pass `faviconPaths` in your `SiteConfig`. The string should contain SVG elements that use `fill="currentColor"` / `stroke="currentColor"` so the kit can tint them with the selected accent. If `faviconPaths` is omitted, the default NukeHub logo is used.

## 404 page

Use the `NotFound` component for a themed 404 page:

```astro
---
import BaseLayout from "@nukehub/docs-kit/components/layout/BaseLayout.astro";
import NotFound from "@nukehub/docs-kit/components/docs/NotFound.astro";
---

<BaseLayout site={SITE} navItems={navItems} title={`404 — Page not found | ${SITE.name}`}>
  <NotFound base={SITE.base} />
</BaseLayout>
```

## Opt-in interactive shortcodes

The kit also provides `Plotly` and `Model3D` shortcodes, but they are not enabled by default because they pull in large runtime dependencies.

To use them:

1. Install the optional peer dependencies in the consumer project:

   ```bash
   npm install plotly.js-dist-min three
   npm install -D @types/plotly.js @types/three
   ```

2. Import the shortcodes and pass them to `DocLayout`:

   ```astro
   ---
   import DocLayout from "@nukehub/docs-kit/components/layout/DocLayout.astro";
   import Plotly from "@nukehub/docs-kit/components/mdx/shortcodes/Plotly.astro";
   import Model3D from "@nukehub/docs-kit/components/mdx/shortcodes/Model3D.astro";
   ---

   <DocLayout ... mdxComponents={{ Plotly, Model3D }} />
   ```

3. Use them in `.mdx` files:

   ```mdx
   <Plotly
     data={[{ x: [1, 2, 3], y: [1, 4, 9], type: "scatter", mode: "lines+markers" }]}
     layout={{ title: "Sample chart" }}
   />

   <Model3D src="/models/example.glb" caption="A sample 3D model." />
   ```

Both components dynamically load their runtime libraries and only render on the client.

## Citations

Docs can declare references in frontmatter and cite them inline. `DocLayout` renders a linked bibliography automatically and offers copy-to-clipboard exports in plain text, BibTeX, and RIS.

1. Add a `references` array to your content schema (the shape is exported from `@nukehub/docs-kit`):

   ```ts
   import { z } from "zod";
   import type { Reference } from "@nukehub/docs-kit";

   const docs = defineCollection({
     loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/docs" }),
     schema: z.object({
       title: z.string(),
       references: z
         .array(
           z.object({
             id: z.string(),
             title: z.string(),
             url: z.string().url(),
             source: z.string().optional(),
             date: z.string().optional(),
             authors: z.array(z.string()).optional(),
             type: z.enum(["article", "book", "inproceedings", "techreport", "misc"]).optional(),
             publisher: z.string().optional(),
             doi: z.string().optional(),
             arxiv: z.string().optional(),
             journal: z.string().optional(),
             volume: z.string().optional(),
             issue: z.string().optional(),
             pages: z.string().optional(),
           }),
         )
         .default([]),
     }),
   });
   ```

2. Pass the references to `DocLayout`:

   ```astro
   ---
   import DocLayout from "@nukehub/docs-kit/components/layout/DocLayout.astro";
   ---

   <DocLayout
     doc={doc}
     headings={headings}
     allDocs={allDocs}
     site={SITE}
     navItems={navItems}
     footerColumns={footerColumns}
     footerLegal={footerLegal}
     references={doc.data.references}
   />
   ```

3. Declare references in frontmatter and cite them in the MDX body:

   ```mdx
   ---
   title: Nuclear data
   references:
     - id: openmc-docs
       title: OpenMC Documentation
       url: https://docs.openmc.org/
       source: OpenMC Development Team
       date: "2023"
   ---

   OpenMC uses continuous-energy nuclear data<Citation id="openmc-docs" />.
   ```

For custom layouts, import `References` directly from `@nukehub/docs-kit/components/mdx/shortcodes/References`.

## Updating the kit

When the kit improves, pull the latest version in any consuming project:

```bash
npm update @nukehub/docs-kit
```

No need to copy files or cherry-pick template changes.

## See also

- [`docs-template`](https://github.com/nukehub-dev/docs-template) — reference consumer of this kit.
