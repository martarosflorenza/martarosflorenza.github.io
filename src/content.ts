// Typed access to the editable JSON files in /content.
// Components never hard-code copy: everything comes from here.
import projectsData from "../content/projects.json";
import profileData from "../content/profile.json";
import manifestData from "./generated/media-manifest.json";

export type Credit = { role: string; name: string };

export type MediaItem = {
  type: "image" | "video";
  src: string;
  width: number;
  height: number;
  alt: string;
  duration?: number;
};

export type Project = {
  slug: string;
  category: string;
  title: string;
  /** Editorial only: the magazine or publication. */
  publication: string | null;
  /** Editorial only: the project name, e.g. "Passion Project". */
  projectName: string | null;
  /** Editorial only: the designer. */
  designer: string | null;
  /** Commercial and runway: the brand or client (never shown on editorial projects). */
  client: string | null;
  /** Music: the artist. */
  artist: string | null;
  /** Production company (never shown on editorial projects). */
  production: string | null;
  year: number | null;
  role: string | null;
  /** Replaces the generated line under the images (role · note). */
  caption: string | null;
  /** A short extra line, e.g. a festival selection. */
  note: string | null;
  description: string;
  credits: Credit[];
  /** When set, the project page shows this YouTube video in an embedded player. */
  youtubeId: string | null;
  /** Explicit cover image (required for YouTube projects, optional otherwise). */
  cover: string | null;
  media: MediaItem[];
};

export type Category = { slug: string; label: string };

export type Profile = {
  name: string;
  role: string;
  location: string;
  bio: string;
  contact: { email: string; phone: string; instagram: string };
  portrait: { src: string; width: number; height: number; alt: string };
  /** Artwork shown on the info page (optional). */
  infoArtwork?: { src: string; width: number; height: number; alt: string };
  homeCover: { src: string; width: number; height: number; alt: string; title: string; credits: Credit[] };
  /** Magazines Marta has worked for (info page). */
  magazines?: string[];
  /** Brands and clients (info page). */
  clients: string[];
  /** Production agencies (info page). */
  productionAgencies?: string[];
  seo: { title: string; description: string };
  settings: { showCredits: boolean };
};

export type ManifestEntry = {
  type: "image" | "video";
  base?: string;
  posterBase?: string;
  width: number;
  height: number;
  widths: number[];
  lqip: string;
};

export const manifest = manifestData as Record<string, ManifestEntry>;
export const profile = profileData as Profile;
export const categories = projectsData.categories as Category[];

// ---------- Forgiving content ----------
// The JSON files are edited by hand, so most fields are optional. A media item can be
// as short as { "src": "/assets/my-shoot/photo-01.jpg" }: its type comes from the file
// extension and its size from the processed media, so nobody has to type pixel sizes.

const VIDEO_EXT = /\.(mp4|mov|webm|m4v)$/i;

type RawMedia = Partial<MediaItem> & { src: string };
type RawProject = Partial<Omit<Project, "media">> & { slug: string; title: string; media?: (RawMedia | string)[] };

function normalizeMedia(raw: RawMedia | string, title: string, index: number): MediaItem {
  const item: RawMedia = typeof raw === "string" ? { src: raw } : raw;
  const type = item.type ?? (VIDEO_EXT.test(item.src) ? "video" : "image");
  const known = manifest[item.src];
  // Fallback ratios only matter if a file could not be processed.
  const width = item.width ?? known?.width ?? (type === "video" ? 1920 : 1200);
  const height = item.height ?? known?.height ?? (type === "video" ? 1080 : 1500);
  return { type, src: item.src, width, height, alt: item.alt || `${title}, ${type} ${index + 1}`, duration: item.duration };
}

function normalizeProject(raw: RawProject): Project {
  return {
    slug: raw.slug,
    category: raw.category ?? categories[0]?.slug ?? "",
    title: raw.title,
    publication: raw.publication ?? null,
    projectName: raw.projectName ?? null,
    designer: raw.designer ?? null,
    client: raw.client ?? null,
    artist: raw.artist ?? null,
    production: raw.production ?? null,
    year: raw.year ?? null,
    role: raw.role ?? null,
    caption: raw.caption ?? null,
    note: raw.note ?? null,
    description: raw.description ?? "",
    credits: raw.credits ?? [],
    youtubeId: raw.youtubeId ?? null,
    cover: raw.cover ?? null,
    media: (raw.media ?? []).map((m, i) => normalizeMedia(m, raw.title, i)),
  };
}

/** Projects in the order they appear in projects.json. Projects with nothing to show are skipped. */
export const projects = (projectsData.projects as RawProject[])
  .map(normalizeProject)
  .filter((p) => p.media.length > 0 || (p.youtubeId && p.cover));

/** Old project addresses that now point to a renamed project: { "old-slug": "new-slug" }. */
export const redirects = ((projectsData as { redirects?: Record<string, string> }).redirects ?? {}) as Record<string, string>;

export const isCategory = (slug: string) => categories.some((c) => c.slug === slug);

/** Address of a category overview page; "all" (or nothing) is the overview of every project. */
export const categoryPath = (slug?: string | null) => (slug && isCategory(slug) ? `/work/${slug}` : "/work");

if (import.meta.env.DEV) {
  // Category pages share the /work/<name> address space with projects, so names must not clash.
  for (const p of projects) {
    if (isCategory(p.slug)) console.warn(`Project slug "${p.slug}" clashes with a category name; rename it.`);
    if (redirects[p.slug]) console.warn(`Project slug "${p.slug}" is also listed as an old address in "redirects".`);
  }
}

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const categoryLabel = (slug: string) =>
  categories.find((c) => c.slug === slug)?.label ?? slug;

export function neighbours(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  return {
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  };
}

/** The project's cover: its explicit "cover" image, else its first still image (or a video poster). */
export function coverOf(p: Project): MediaItem {
  if (p.cover) return normalizeMedia({ src: p.cover, type: "image", alt: p.title }, p.title, 0);
  return p.media.find((m) => m.type === "image") ?? p.media[0];
}

/**
 * Video projects (YouTube, or a landscape film) are always shown horizontal (16:9) in lists.
 * Vertical clips such as social-media videos keep their own shape.
 */
export function isHorizontalVideo(p: Project) {
  if (p.youtubeId) return true;
  const cover = coverOf(p);
  return cover.type === "video" && cover.width > cover.height;
}

/** The short line under the images: the "caption" if set, otherwise role · note · credits. */
export function creditLine(p: Project) {
  if (p.caption) return p.caption;
  const parts = [p.role, p.note].filter(Boolean) as string[];
  if (profile.settings.showCredits) {
    for (const c of p.credits) parts.push(`${c.role} ${c.name}`);
  }
  return parts.join(" · ");
}

/** The main name shown next to the credit line: publication, client or artist. */
export const primaryName = (p: Project) => (p.category === "editorial" ? p.publication : p.client ?? p.artist ?? p.publication);

/**
 * Label/value pairs for the project information block, in display order.
 * Editorial projects never show "client" or "production".
 */
export function projectFacts(p: Project): [string, string][] {
  const editorial = p.category === "editorial";
  const rows: [string, string | number | null][] = editorial
    ? [["publication", p.publication], ["project", p.projectName], ["designer", p.designer]]
    : [["client", p.client], ["artist", p.artist], ["production", p.production]];
  rows.push(["role", p.role], ["year", p.year]);
  if (p.note) rows.push(["", p.note]);
  if (profile.settings.showCredits) for (const c of p.credits) rows.push([c.role, c.name]);
  return rows.filter((r): r is [string, string | number] => r[1] !== null && r[1] !== "").map(([k, v]) => [k, String(v)]);
}

export const pad = (n: number) => String(n).padStart(2, "0");
