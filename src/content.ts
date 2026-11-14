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
  client: string | null;
  year: number | null;
  role: string | null;
  description: string;
  credits: Credit[];
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
  clients: string[];
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
    client: raw.client ?? null,
    year: raw.year ?? null,
    role: raw.role ?? null,
    description: raw.description ?? "",
    credits: raw.credits ?? [],
    media: (raw.media ?? []).map((m, i) => normalizeMedia(m, raw.title, i)),
  };
}

/** Projects in the order they appear in projects.json. Projects without media are skipped. */
export const projects = (projectsData.projects as RawProject[])
  .map(normalizeProject)
  .filter((p) => p.media.length > 0);

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

/** First still image of a project (or a video poster) used as its cover. */
export const coverOf = (p: Project) => p.media.find((m) => m.type === "image") ?? p.media[0];

/** "stylist · photography Talia Chetrit" — empty when credits are switched off. */
export function creditLine(p: Project) {
  const parts = [p.role?.toLowerCase()].filter(Boolean) as string[];
  if (profile.settings.showCredits) {
    for (const c of p.credits) parts.push(`${c.role} ${c.name}`);
  }
  return parts.join(" · ");
}

export const pad = (n: number) => String(n).padStart(2, "0");
