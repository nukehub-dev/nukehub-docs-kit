#!/usr/bin/env node
import { readFile, writeFile, rm, cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    src: null,
    dst: path.resolve(process.cwd(), "src", "content", "docs"),
    repoRoot: process.cwd(),
    githubFileBase: null,
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];
    switch (arg) {
      case "--src":
        options.src = path.resolve(process.cwd(), next);
        i++;
        break;
      case "--dst":
        options.dst = path.resolve(process.cwd(), next);
        i++;
        break;
      case "--repo-root":
        options.repoRoot = path.resolve(process.cwd(), next);
        i++;
        break;
      case "--github-file-base":
        options.githubFileBase = next;
        i++;
        break;
      default:
        if (arg.startsWith("--")) {
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
        }
    }
  }
  return options;
}

const { src: explicitSrc, dst: docsDst, repoRoot, githubFileBase } = parseArgs();

// Default source: ../docs relative to cwd if it exists, otherwise ./docs
const parentDocs = path.resolve(process.cwd(), "..", "docs");
const localDocs = path.resolve(process.cwd(), "docs");
const docsSrc = explicitSrc ?? (existsSync(parentDocs) ? parentDocs : localDocs);

async function copyDir(src, dst) {
  await mkdir(dst, { recursive: true });
  const entries = await (
    await import("node:fs/promises")
  ).readdir(src, {
    withFileTypes: true,
  });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, dstPath);
    } else {
      await cp(srcPath, dstPath, { preserveTimestamps: true });
    }
  }
}

function yamlScalar(value) {
  const safe = value.replace(/"/g, '\\"').replace(/\n/g, " ");
  return `"${safe}"`;
}

async function injectFrontmatter(filePath) {
  const content = await readFile(filePath, "utf-8");
  const hasFrontmatter = content.trimStart().startsWith("---");

  const bodyWithoutH1 = content.replace(/^#\s+.+$/m, "").trimStart();

  if (hasFrontmatter) {
    await writeFile(filePath, bodyWithoutH1);
    return;
  }

  const match = content.match(/^#\s+(.+)$/m);
  const title = match ? match[1].trim() : path.basename(filePath, ".md");

  const lines = ["---", `title: ${yamlScalar(title)}`, "---", ""];
  await writeFile(filePath, lines.join("\n") + bodyWithoutH1);
}

function isExternalHref(href) {
  return !href || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("/") || href.startsWith("#");
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

// Route segment for a docs-root-relative file: "tutorials/getting-started.md"
// -> "tutorials/getting-started"; "theory/index.mdx" -> "theory".
function routeOf(relFile) {
  let route = relFile.replace(/\.(md|mdx)$/i, "");
  route = route.replace(/(^|\/)(index|README)$/, "");
  return route.replace(/\/$/, "");
}

function rewriteMarkdownLinks(content, currentFile) {
  const currentRel = toPosix(path.relative(docsDst, currentFile));
  const currentIsRootIndex = currentRel === "index.md";
  const currentRoute = routeOf(currentRel);
  // Page URLs are directory-like ("<route>/"), so the browser resolves
  // relative links one segment deeper than the source file's directory.
  const upPrefix = "../".repeat(currentRoute === "" ? 0 : currentRoute.split("/").length);
  const docsRelToRepo = toPosix(path.relative(repoRoot, docsSrc));

  return content.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (match, text, href) => {
    if (isExternalHref(href)) return match;

    let [url, fragment] = href.split("#");
    fragment = fragment ? `#${fragment}` : "";

    const basename = path.basename(url);

    if (githubFileBase) {
      if (basename === "README.md" && currentIsRootIndex) {
        return `[${text}](${githubFileBase}/README.md${fragment})`;
      }
      if (basename === "AGENTS.md") {
        return `[${text}](${githubFileBase}/AGENTS.md${fragment})`;
      }
    }

    if (basename === "CHANGELOG.md") {
      return `[${text}](${upPrefix}changelog/${fragment})`;
    }

    if (/\.(md|mdx)$/i.test(basename)) {
      // Resolve against the source file's location inside the docs tree.
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(currentRel), url));
      if (target.startsWith("..")) {
        // Points outside the docs tree at a repo file; link to GitHub.
        if (githubFileBase) {
          const repoRel = path.posix.normalize(path.posix.join(docsRelToRepo, target));
          return `[${text}](${githubFileBase}/${repoRel}${fragment})`;
        }
        return match;
      }
      const targetRoute = routeOf(target);
      const rewritten = targetRoute === "" ? upPrefix || "./" : `${upPrefix}${targetRoute}/`;
      return `[${text}](${rewritten}${fragment})`;
    }

    return match;
  });
}

async function rewriteLinksInFile(filePath) {
  const content = await readFile(filePath, "utf-8");
  const rewritten = rewriteMarkdownLinks(content, filePath);
  if (rewritten !== content) {
    await writeFile(filePath, rewritten);
  }
}

async function main() {
  if (!existsSync(docsSrc)) {
    throw new Error(`Docs source not found: ${docsSrc}`);
  }

  if (existsSync(docsDst)) {
    await rm(docsDst, { recursive: true, force: true });
  }

  await copyDir(docsSrc, docsDst);

  const repoChangelog = path.join(repoRoot, "CHANGELOG.md");
  const changelogDst = path.join(docsDst, "changelog.md");
  if (existsSync(repoChangelog) && !existsSync(changelogDst)) {
    await cp(repoChangelog, changelogDst, { preserveTimestamps: true });
  }

  const readmePath = path.join(docsDst, "README.md");
  const indexPath = path.join(docsDst, "index.md");
  if (existsSync(readmePath)) {
    await cp(readmePath, indexPath, { preserveTimestamps: true });
    await rm(readmePath);
  }

  async function walk(dir) {
    const entries = await (
      await import("node:fs/promises")
    ).readdir(dir, {
      withFileTypes: true,
    });
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
        await rewriteLinksInFile(entryPath);
        await injectFrontmatter(entryPath);
      }
    }
  }
  await walk(docsDst);

  console.log(`Synced docs from ${docsSrc} to ${docsDst}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
