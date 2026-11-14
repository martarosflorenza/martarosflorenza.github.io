// Turns dist-preview/index.html into a page body for a claude.ai Artifact and collects
// the media it references (WebP at two widths + original videos) next to it.
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT = join(ROOT, "dist-preview");
const manifest = JSON.parse(await readFile(join(ROOT, "src/generated/media-manifest.json"), "utf8"));

// Must match availableWidths() in src/lib/paths.ts
const pick = (widths) => {
  const small = widths.find((w) => w >= 960) ?? widths[widths.length - 1];
  const large = [...widths].reverse().find((w) => w <= 1600) ?? small;
  return [...new Set([small, large])];
};

const html = await readFile(join(OUT, "index.html"), "utf8");
const title = "<title>Marta Ros Florenza</title>";
const metas = (html.match(/<meta name="description"[^>]*>/g) ?? []).join("\n");
const styles = (html.match(/<style[\s\S]*?<\/style>/g) ?? []).join("\n");
const scripts = (html.match(/<script[\s\S]*?<\/script>/g) ?? []).join("\n");
const page = `${title}\n${metas}\n${styles}\n<div id="root"></div>\n${scripts}\n`;
await writeFile(join(OUT, "page.html"), page);

const files = {};
for (const [src, entry] of Object.entries(manifest)) {
  const base = entry.type === "video" ? entry.posterBase : entry.base;
  for (const w of pick(entry.widths)) {
    const rel = `${base.slice(1)}-${w}.webp`;
    files[rel] = rel;
  }
  if (entry.type === "video") files[src.slice(1)] = src.slice(1);
}
for (const rel of Object.keys(files)) {
  const target = join(OUT, rel);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(join(ROOT, "public", rel), target);
}
const images = Object.keys(files).filter((f) => !f.endsWith(".mp4"));
const videos = Object.keys(files).filter((f) => f.endsWith(".mp4"));
await writeFile(join(OUT, "files-images.json"), JSON.stringify(Object.fromEntries(images.map((f) => [f, f])), null, 0));
await writeFile(join(OUT, "files-videos.json"), JSON.stringify(Object.fromEntries(videos.map((f) => [f, f])), null, 0));
console.log(`page.html ${(page.length / 1024).toFixed(0)} KB, ${images.length} images, ${videos.length} videos`);
