// Generates responsive AVIF/WebP variants, video posters and tiny blurred
// placeholders for everything in public/assets. Originals are never modified.
// Output: public/img/** and src/generated/media-manifest.json
import { readdir, mkdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative, dirname, extname, basename } from "node:path";
import { execFileSync } from "node:child_process";
import os from "node:os";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC_DIR = join(ROOT, "public/assets");
const OUT_DIR = join(ROOT, "public/img");
const MANIFEST = join(ROOT, "src/generated/media-manifest.json");
const WIDTHS = [480, 960, 1600, 2400];
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".webm"]);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

async function isFresh(target, source) {
  if (!existsSync(target)) return false;
  return (await stat(target)).mtimeMs >= (await stat(source)).mtimeMs;
}

async function processImage(input, outBase) {
  const meta = await sharp(input).metadata();
  const widths = WIDTHS.filter((w) => w < meta.width);
  widths.push(Math.min(meta.width, WIDTHS[WIDTHS.length - 1]));
  const unique = [...new Set(widths)].sort((a, b) => a - b);
  for (const w of unique) {
    for (const fmt of ["avif", "webp"]) {
      const target = `${outBase}-${w}.${fmt}`;
      if (await isFresh(target, input)) continue;
      const pipeline = sharp(input).rotate().resize({ width: w, withoutEnlargement: true });
      if (fmt === "avif") await pipeline.avif({ quality: 58, effort: 4 }).toFile(target);
      else await pipeline.webp({ quality: 80 }).toFile(target);
    }
  }
  const lqipBuf = await sharp(input).rotate().resize({ width: 16 }).blur(1).webp({ quality: 40 }).toBuffer();
  return {
    width: meta.width,
    height: meta.height,
    widths: unique,
    lqip: `data:image/webp;base64,${lqipBuf.toString("base64")}`,
  };
}

async function main() {
  const files = (await walk(SRC_DIR)).sort();
  const manifest = {};
  const queue = [...files];
  const workers = Array.from({ length: Math.max(2, os.cpus().length - 1) }, async () => {
    while (queue.length) {
      const file = queue.shift();
      const ext = extname(file).toLowerCase();
      const rel = "/" + relative(join(ROOT, "public"), file);
      const outBase = join(OUT_DIR, relative(SRC_DIR, dirname(file)), basename(file, ext));
      await mkdir(dirname(outBase), { recursive: true });
      if (IMAGE_EXT.has(ext)) {
        const info = await processImage(file, outBase);
        manifest[rel] = { type: "image", base: "/" + relative(join(ROOT, "public"), outBase), ...info };
      } else if (VIDEO_EXT.has(ext)) {
        // Grab a frame one second in as the poster, then treat it like an image.
        const posterSrc = `${outBase}-poster.png`;
        if (!(await isFresh(posterSrc, file))) {
          execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", "1", "-i", file, "-frames:v", "1", posterSrc]);
        }
        const info = await processImage(posterSrc, `${outBase}-poster`);
        manifest[rel] = { type: "video", posterBase: "/" + relative(join(ROOT, "public"), `${outBase}-poster`), ...info };
      }
      process.stdout.write(".");
    }
  });
  await Promise.all(workers);
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(MANIFEST, JSON.stringify(sorted, null, 1));
  console.log(`\n${Object.keys(sorted).length} media entries written to ${relative(ROOT, MANIFEST)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
