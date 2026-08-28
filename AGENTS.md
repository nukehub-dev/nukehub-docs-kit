# Nuke Agent Doc (NAD): nukehub-docs-kit

## Purpose

Shared package that powers NukeHub documentation sites. It ships the Astro + React + Tailwind v4 layouts, components, MDX shortcodes, theme, integrations, and sync tooling that every NukeHub project consumes instead of copying.

## Ownership

This root `AGENTS.md` owns the package API, component contracts, release workflow, and quality standards for `nukehub-docs-kit`. It inherits the NAD framework from parent NukeHub project docs when one exists.

## NAD Core Contract

- `AGENTS.md` files are binding work contracts for their subtrees.
- Work products, source materials, instructions, records, assets, and durable docs must stay understandable from the nearest applicable `AGENTS.md` plus every parent `AGENTS.md` above it.

### Read Before Editing

1. Read this root `AGENTS.md`.
2. Identify every file or folder you expect to touch.
3. Walk from the repository root to each target path.
4. Read every `AGENTS.md` found along each route.
5. If a parent `AGENTS.md` lists a child `AGENTS.md` whose scope contains the path, read that child and continue from there.
6. Use the nearest `AGENTS.md` as the local contract and parent docs for repo-wide rules.
7. If docs conflict, the closer doc controls local work details, but no child doc may weaken NAD.

### Update After Editing

Every meaningful change requires a NAD pass before the task is done.

Update the closest owning `AGENTS.md` when a change affects:

- purpose, scope, ownership, or responsibilities
- durable structure, contracts, workflows, or operating rules
- required inputs, outputs, permissions, constraints, side effects, or artifacts
- user preferences about behavior, communication, process, organization, or quality
- `AGENTS.md` creation, deletion, move, rename, or index contents

Update `README.md` when a change alters user-visible behavior — public API, install steps, component props, shortcodes, or usage examples.

### Docs Pass

`AGENTS.md` updates do not cover user docs. In the same change, also update `README.md` when a change alters public API or install/dev workflows.

## Hierarchy

- Root `AGENTS.md` is the NAD rail: project-wide instructions, global preferences, durable workflow rules, and the top-level Child NAD Index.
- Child `AGENTS.md` files own domain-specific instructions and their own Child NAD Index.
- Each parent explains what its direct children cover and what stays owned by the parent.
- The closer a doc is to the work, the more specific and practical it must be.

## Child Doc Shape

Create a child `AGENTS.md` when a folder becomes a durable boundary with its own purpose, rules, responsibilities, workflow, materials, or quality standards.

Default section order:

- Purpose
- Ownership
- Local Contracts
- Work Guidance
- Verification
- Child NAD Index

## Style

- Keep docs concise, current, and operational.
- Document stable contracts, not diary entries.
- Put broad rules in parent docs and concrete details in child docs.
- Prefer direct bullets with explicit names.
- Do not duplicate rules across many files unless each scope needs a local version.
- Delete stale notes instead of explaining history.
- Trim obvious statements, repeated rules, misplaced detail, and warnings for risks that no longer exist.

## Closeout

1. Re-check changed paths against the NAD chain.
2. Update the nearest owning docs and any affected parents or children.
3. Refresh every affected Child NAD Index.
4. Remove stale or contradictory text.
5. Run existing verification when relevant.
6. Report any docs intentionally left unchanged and why.

---

## nukehub-docs-kit Project Guidance

## Required tooling

Install once before making changes:

- **Node.js** 22 LTS.
- **npm** (comes with Node).

## Before committing

Run these from the repo root:

```bash
npm install
npm run lint           # eslint . — zero errors required
npm run format:check   # prettier check on src/** and root configs
npm run check          # astro typecheck
```

Notes:

- `npm run lint` must end with `0 errors`.
- `npm run format:check` must report no formatting issues.
- `npm run check` must report zero errors.
- Full build verification happens in the consumer projects (`docs-template`, `nucleide/docs-site`, etc.).

## Architecture pointer

High-level layout:

- `src/components/` — UI pieces:
  - `layout/` — `BaseLayout`, `DocLayout`, `Header`, `Footer`, `Sidebar`.
  - `shared/` — `CommandPalette`, `ThemeToggle`, `SearchButton`, `ScrollProgress`, `GlobalContextMenu`, `GlassContextMenu`, `ImageLightbox`.
  - `ui/` — primitives: `Button`, `Card`, `Tooltip`, `Logo`, `Input`, `Image`.
  - `docs/` — `TableOfContents`, `Pagination`, `EditLink`, `NotFound`.
  - `mdx/` — shortcode implementations and Astro wrappers under `mdx/shortcodes/`.
- `src/lib/` — shared helpers: `utils.ts` (`cn`), `theme.ts`, `docs.ts`, `site.ts`, `nav.ts`, `footer.ts`, `useCommandPalette.ts`, `useFocusTrap.ts`.
- `src/styles/global.css` — Tailwind v4 entry, theme tokens, prose overrides, scrollbar styles, cursor utilities, and `.bubble` glass utility.
- `src/integrations/markdown-negotiation.ts` — Astro build integration that emits a Markdown sibling for every HTML page.
- `src/scripts/sync-docs.mjs` — `nukehub-sync-docs` CLI; copies a `docs/` tree into `src/content/docs/`, injects frontmatter, rewrites `.md` links, and copies the repo `CHANGELOG.md`.
- `src/data/` — default/example `site.ts`, `nav.ts`, `footer.ts`. Consumers override by passing their own data as props.
- `src/index.ts` — public API surface: types, default data, `markdownNegotiation`, `Logo`, `GitHubIcon`, and helpers.
- `package.json` — defines peer dependencies and subpath exports for `components/`, `integrations/`, `lib/`, `styles/`, `data/`, and `scripts/`.
- `.github/workflows/ci.yml` — PR/push CI: format check, typecheck, build.

## Local Contracts

- **No Starlight**: do not add `@astrojs/starlight`. The whole UI is custom.
- **Props-driven identity**: components must receive project-specific data (`site`, `navItems`, `footerColumns`, `footerLegal`) as props. Do not import consumer data files from inside the kit.
- **Source package**: publish the `src/` directory. The package does not compile to a `dist/`; Astro and TypeScript consume the source directly.
- **Peer dependencies**: `astro`, `react`, `react-dom`, `@astrojs/react`, `@astrojs/mdx`, `@astrojs/sitemap`, `@tailwindcss/vite`, `tailwindcss`, `tailwind-merge`, and `clsx` are peer dependencies. Consumers install them.
- **Internal imports use relative paths**: inside the kit, use relative imports so the package works from `node_modules` without Vite aliases.
- **Tailwind source scanning**: `src/styles/global.css` must include an `@source` directive that points at the kit's component directory (e.g. `@source "../components";`) so Tailwind generates utility classes used inside the package when it is consumed from `node_modules`.
- **MDX shortcodes**: `Callout`, `Tabs`, `TabItem`, `FileTree`, `Mermaid`, `Steps`, `Step`, `YouTube`, `Odysee`, `ImageFigure`, and `DataTable` are registered in `DocLayout` and available in `.mdx` files.
- **Theme engine**: stores the preference in `localStorage` under `docs-theme` and applies it via `data-theme` on `<html>`. The default is dark. Accent color is stored under `docs-accent` and applied via `data-accent`; the favicon and `<meta name="theme-color">` are regenerated to match the resolved theme and accent.
- **Code copy buttons**: every `<pre>` block inside `.prose` automatically gets a copy button via the inline script in `BaseLayout`.
- **Custom context menu**: `GlobalContextMenu` is mounted in `BaseLayout`. It relies on `framer-motion` and the `.bubble` utility in `global.css`.
- **Markdown siblings**: every built HTML page also gets a Markdown sibling via the `markdownNegotiation` integration.

## Work Guidance

- Keep components functional and props-driven. Prefer explicit props over global/config imports.
- Match the existing style: functional React components, `cn()` for classes, `lucide-react` icons.
- Use `data-theme` for theming. The storage key is `docs-theme` and the default is dark.
- Keep React islands lightweight. Heavy dependencies (for example, `mermaid`) should be dynamically imported inside client components and rendered with `client:visible` or `client:load` only when needed.
- Internal Markdown links must never contain `.md` in the rendered output; `nukehub-sync-docs` handles this.
- Do not commit build outputs (`dist/`, `.astro/`) or dependencies (`node_modules/`). Use the provided `.gitignore`.
- When adding a new MDX shortcode, add both the component and a wrapper under `src/components/mdx/shortcodes/` if needed, then register it in `DocLayout`.

## Verification

- `npm run lint` — ESLint check.
- `npm run format:check` — Prettier check.
- `npm run check` — Astro TypeScript check.
- CI runs the same checks on every pull request and push to `main`.
- Full build verification happens in the consumer projects.

## Release workflow

Releases are automated via `.github/workflows/release.yml`.

1. Run the bump script:
   ```bash
   scripts/bump-version.sh 0.2.0
   ```
   This updates `package.json` and stamps the `[Unreleased]` section in `CHANGELOG.md`.
2. Review the diff, commit, and tag:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore: bump version to 0.2.0"
   git tag v0.2.0
   git push origin main --tags
   ```
3. The workflow runs verification, publishes to npm with provenance, and drafts a GitHub release.

To publish manually (for example, from a local checkout):

```bash
npm publish --access public
```

4. Consumers update with `npm update @nukehub/docs-kit` and rebuild.

## Common pitfalls

- **Do not import consumer data from inside the kit.** The kit is shared; project-specific values arrive via props.
- **React islands run on the client.** Any direct use of `document` or `window` outside `useEffect` (or without a mounted guard) will fail SSR. Use `client:only="react"` or the `mounted` pattern from `GlassContextMenu` if a component must never render on the server.
- **Do not edit generated files.** `dist/`, `.astro/`, and `node_modules/.vite/` are regenerated. Change source only.
- **Astro `.astro` files cannot be re-exported from a `.ts` index.** Import layouts directly from their subpath, e.g. `@nukehub/docs-kit/components/layout/DocLayout.astro`.
- **Sync docs before verifying.** `npm run build` runs `sync-docs` automatically, but running `astro build` directly will use stale `src/content/docs/`.
- **Update consumers after kit changes.** Consumers must reinstall the kit for changes to take effect. Local file dependencies may require `rm -rf node_modules/@nukehub/docs-kit && npm install`.

## Child NAD Index

No children yet. Create a child `AGENTS.md` if the kit grows a durable sub-boundary (for example, a separate `packages/` workspace or a custom integration folder).
