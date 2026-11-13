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

export const profile = profileData as Profile;
export const categories = projectsData.categories as Category[];
export const projects = projectsData.projects as Project[];
export const manifest = manifestData as Record<string, ManifestEntry>;

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
