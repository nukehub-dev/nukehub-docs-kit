import type { CollectionEntry } from "astro:content";

export interface SidebarNode {
  slug: string;
  title: string;
  order: number;
  count?: number;
  children?: SidebarNode[];
}

export interface SidebarSection {
  category: string;
  order: number;
  items: SidebarNode[];
}

const CATEGORY_ORDER: Record<string, number> = {
  home: 0,
  tutorials: 1,
  reference: 2,
  development: 3,
  architecture: 4,
  plan: 5,
  examples: 6,
};

function humanize(name: string): string {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\.mdx?$/i, "")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getCategory(slug: string): string {
  const parts = slug.split("/");
  if (parts.length === 1) return "home";
  return parts[0];
}

export function getCategoryLabel(category: string): string {
  if (category === "home") return "Home";
  return humanize(category);
}

export function sortByOrderOrName(
  a: { order: number; title: string },
  b: { order: number; title: string },
): number {
  if (a.order !== b.order) return a.order - b.order;
  return a.title.localeCompare(b.title);
}

interface TreeNode {
  title: string;
  slug: string;
  order: number;
  children: Record<string, TreeNode>;
}

function buildTree(docs: CollectionEntry<"docs">[]): Record<string, TreeNode> {
  const roots: Record<string, TreeNode> = {};

  for (const doc of docs) {
    if (doc.data.draft) continue;

    const rawSlug = doc.id.replace(/\.mdx?$/i, "");
    const parts = rawSlug.split("/");
    const category = parts[0] === "index" ? "home" : parts[0];
    const segments = parts[0] === "index" ? [] : parts.slice(1);

    const label = doc.data.sidebar?.label ?? doc.data.title ?? humanize(doc.id);
    const order = doc.data.sidebar?.order ?? (doc.id.endsWith("index.md") ? 0 : 999);

    if (!roots[category]) {
      roots[category] = {
        title: getCategoryLabel(category),
        slug: "",
        order: CATEGORY_ORDER[category] ?? 99,
        children: {},
      };
    }

    // Root index.md becomes the single page under the Home section.
    if (category === "home" && segments.length === 0) {
      roots[category].children["index"] = {
        title: label,
        slug: rawSlug,
        order,
        children: {},
      };
      continue;
    }

    let parent = roots[category].children;
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isLast = i === segments.length - 1;

      if (isLast) {
        if (segment === "index") {
          // index.md in a folder becomes the folder node itself.
          const folderKey = segments[i - 1];
          if (folderKey && parent[folderKey]) {
            parent[folderKey].slug = rawSlug;
            parent[folderKey].title = label;
            parent[folderKey].order = order;
          }
        } else {
          parent[segment] = {
            title: label,
            slug: rawSlug,
            order,
            children: {},
          };
        }
      } else {
        if (!parent[segment]) {
          parent[segment] = {
            title: humanize(segment),
            slug: "",
            order: 0,
            children: {},
          };
        }
        parent = parent[segment].children;
      }
    }
  }

  return roots;
}

function treeToNodes(nodeMap: Record<string, TreeNode>): SidebarNode[] {
  const nodes: SidebarNode[] = [];
  for (const node of Object.values(nodeMap)) {
    const children = treeToNodes(node.children);
    let count = node.slug ? 1 : 0;
    for (const child of children) {
      count += child.count ?? 0;
    }
    const item: SidebarNode = {
      slug: node.slug,
      title: node.title,
      order: node.order,
      count,
    };
    if (children.length > 0) {
      item.children = children;
    }
    nodes.push(item);
  }
  nodes.sort(sortByOrderOrName);
  return nodes;
}

export function buildSidebar(docs: CollectionEntry<"docs">[]): SidebarSection[] {
  const tree = buildTree(docs);
  const sections: SidebarSection[] = [];

  for (const [category, root] of Object.entries(tree)) {
    sections.push({
      category,
      order: root.order,
      items: treeToNodes(root.children),
    });
  }

  sections.sort((a, b) => a.order - b.order);
  return sections;
}

export interface CommandPalettePage {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
}

function flattenNodes(nodes: SidebarNode[]): { title: string; slug: string }[] {
  const result: { title: string; slug: string }[] = [];
  for (const node of nodes) {
    if (node.slug) {
      result.push({ title: node.title, slug: node.slug });
    }
    if (node.children) {
      result.push(...flattenNodes(node.children));
    }
  }
  return result;
}

export function getFlatPages(
  docs: CollectionEntry<"docs">[],
  nav: { title: string; url: string; newpage?: boolean }[],
): CommandPalettePage[] {
  const pages: CommandPalettePage[] = [];
  const sections = buildSidebar(docs);

  for (const section of sections) {
    for (const item of flattenNodes(section.items)) {
      pages.push({
        id: item.slug,
        title: item.title,
        url: item.slug === "index" ? "" : `${item.slug}/`,
        description: docs.find((d) => d.id.replace(/\.mdx?$/i, "") === item.slug)?.data.description,
        category: getCategoryLabel(section.category),
      });
    }
  }

  for (const item of nav) {
    if (item.newpage) continue;
    pages.push({
      id: `nav-${item.title}`,
      title: item.title,
      url: item.url,
      category: "Navigation",
    });
  }

  return pages;
}

export interface PaginationLink {
  slug: string;
  title: string;
}

export function getPrevNext(
  docs: CollectionEntry<"docs">[],
  currentSlug: string,
): { prev?: PaginationLink; next?: PaginationLink } {
  const sections = buildSidebar(docs);
  const flat: PaginationLink[] = [];

  for (const section of sections) {
    for (const item of flattenNodes(section.items)) {
      flat.push({ slug: item.slug, title: item.title });
    }
  }

  const idx = flat.findIndex((item) => item.slug === currentSlug);
  if (idx === -1) return {};

  return {
    prev: idx > 0 ? flat[idx - 1] : undefined,
    next: idx < flat.length - 1 ? flat[idx + 1] : undefined,
  };
}

export function slugToHref(base: string, slug: string): string {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  if (!slug || slug === "index") return normalizedBase;
  return `${normalizedBase}${slug.replace(/^\//, "")}/`;
}
