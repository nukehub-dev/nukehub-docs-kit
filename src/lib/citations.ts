/**
 * Citation formatting for documentation references.
 *
 * References are declared in frontmatter and cited inline with the
 * `<Citation id="..." />` shortcode. This module generates the human-readable
 * citation text and the machine-readable BibTeX / RIS export formats.
 */

export type ReferenceType = "article" | "book" | "inproceedings" | "techreport" | "misc";

export interface Reference {
  id: string;
  title: string;
  url: string;
  /** Human-readable source or venue name. */
  source?: string;
  /** Free-form date or year. */
  date?: string;
  /** List of authors in "First Last" or "Last, First" form. */
  authors?: string[];
  type?: ReferenceType;
  publisher?: string;
  doi?: string;
  arxiv?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
}

export interface CopyFormat {
  id: "text" | "bibtex" | "ris";
  label: string;
  text: string;
}

/** Extract a four-digit year from a date string, if present. */
function extractYear(date: string | undefined): string | undefined {
  return date?.match(/\d{4}/)?.[0];
}

/** Extract an ISO YYYY-MM-DD date from a date string, if present. */
function extractFullDate(date: string | undefined): string | undefined {
  return date?.match(/\d{4}-\d{2}-\d{2}/)?.[0];
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function bibtexValue(value: string): string {
  return value.replace(/[{}]/g, "");
}

function splitPages(pages: string | undefined): { start?: string; end?: string } {
  if (!pages) return {};
  const [start, end] = pages.split(/\s*[-–—]\s*/, 2);
  return { start, end };
}

/**
 * Human-readable one-line citation.
 *
 * Tries to produce an academic citation when journal/volume/pages are present,
 * otherwise falls back to a simpler source/title/date/URL form.
 */
export function formatCitationText(ref: Reference): string {
  const year = extractYear(ref.date);

  if (ref.authors && ref.authors.length > 0 && ref.journal) {
    const parts: string[] = [];
    parts.push(`${ref.authors.join(", ")}.`);
    parts.push(`"${ref.title}."`);
    parts.push(ref.journal);
    if (ref.volume) {
      let vol = ref.volume;
      if (ref.issue) vol += `(${ref.issue})`;
      parts.push(vol);
    }
    if (ref.pages) parts.push(`: ${ref.pages}`);
    if (year) parts.push(`(${year})`);
    if (ref.doi) parts.push(`https://doi.org/${ref.doi}`);
    else parts.push(ref.url);
    return parts.join(" ") + ".";
  }

  const parts: string[] = [];
  if (ref.source) parts.push(ref.source);
  if (ref.authors && ref.authors.length > 0) {
    parts.push(ref.authors.join(", "));
  }
  parts.push(`"${ref.title}"`);
  if (ref.date) parts.push(`(${ref.date})`);
  parts.push(ref.doi ? `https://doi.org/${ref.doi}` : ref.url);
  return parts.join(". ") + ".";
}

export function formatBibTeX(ref: Reference, accessed: string = todayISO()): string {
  const type = ref.type ?? "misc";
  const lines = [`@${type}{${ref.id},`];
  lines.push(`  title = {${bibtexValue(ref.title)}},`);

  if (ref.authors && ref.authors.length > 0) {
    lines.push(`  author = {${ref.authors.map(bibtexValue).join(" and ")}},`);
  }

  const year = extractYear(ref.date);
  if (year) lines.push(`  year = {${year}},`);

  const fullDate = extractFullDate(ref.date);
  if (fullDate) {
    lines.push(`  month = {${Number(fullDate.slice(5, 7))}},`);
  }

  if (type === "article" && ref.journal) {
    lines.push(`  journal = {${bibtexValue(ref.journal)}},`);
    if (ref.volume) lines.push(`  volume = {${bibtexValue(ref.volume)}},`);
    if (ref.issue) lines.push(`  number = {${bibtexValue(ref.issue)}},`);
    if (ref.pages) lines.push(`  pages = {${bibtexValue(ref.pages)}},`);
  } else {
    const venue = ref.publisher ?? ref.source;
    if (venue) {
      const field = type === "misc" ? "howpublished" : "publisher";
      lines.push(`  ${field} = {${bibtexValue(venue)}},`);
    }
  }

  if (ref.doi) lines.push(`  doi = {${bibtexValue(ref.doi)}},`);
  if (ref.arxiv) {
    lines.push(`  eprint = {${bibtexValue(ref.arxiv)}},`);
    lines.push(`  archivePrefix = {arXiv},`);
  }

  lines.push(`  url = {${ref.url}},`);
  lines.push(`  urldate = {${accessed}},`);
  lines.push("}");

  return lines.join("\n");
}

const RIS_TYPES: Record<ReferenceType, string> = {
  article: "JOUR",
  book: "BOOK",
  inproceedings: "CONF",
  techreport: "RPRT",
  misc: "GEN",
};

export function formatRIS(ref: Reference, accessed: string = todayISO()): string {
  const type = ref.type ?? "misc";
  const lines = [`TY  - ${RIS_TYPES[type]}`, `TI  - ${ref.title}`];

  for (const author of ref.authors ?? []) {
    lines.push(`AU  - ${author}`);
  }

  const year = extractYear(ref.date);
  if (year) lines.push(`PY  - ${year}`);

  const fullDate = extractFullDate(ref.date);
  if (fullDate) lines.push(`DA  - ${fullDate.replaceAll("-", "/")}`);

  if (type === "article" && ref.journal) {
    lines.push(`JO  - ${ref.journal}`);
  } else {
    const venue = ref.publisher ?? ref.source;
    if (venue) lines.push(`PB  - ${venue}`);
  }

  if (ref.volume) lines.push(`VL  - ${ref.volume}`);
  if (ref.issue) lines.push(`IS  - ${ref.issue}`);

  const { start, end } = splitPages(ref.pages);
  if (start) lines.push(`SP  - ${start}`);
  if (end) lines.push(`EP  - ${end}`);

  if (ref.doi) lines.push(`DO  - ${ref.doi}`);
  lines.push(`UR  - ${ref.url}`);
  lines.push(`Y2  - ${accessed.replaceAll("-", "/")}`);
  lines.push("ER  -");

  return lines.join("\n");
}

/**
 * All copy formats offered by the reference list, default first.
 * `accessed` defaults to today and is stamped into BibTeX (`urldate`) and
 * RIS (`Y2`) because most references are web sources.
 */
export function buildCopyFormats(ref: Reference, accessed: string = todayISO()): CopyFormat[] {
  return [
    { id: "text", label: "Citation text", text: formatCitationText(ref) },
    { id: "bibtex", label: "BibTeX", text: formatBibTeX(ref, accessed) },
    { id: "ris", label: "RIS", text: formatRIS(ref, accessed) },
  ];
}
