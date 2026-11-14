// Generates responsive AVIF/WebP variants, video posters and tiny blurred
// placeholders for everything in public/assets. Originals are never modified.
//
// Output: public/img/** and src/generated/media-manifest.json
//
// It runs automatically before every build (`npm run build`), so new photos only
// need to be uploaded to public/assets. Work is cached by file content: a file
// is processed again only when it is new or has changed, so builds stay fast.
import { readdir, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, dirname, extname, basename } from "node:path";
import { execFileSync } from "node:child_process";
import os from "node:os";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const PUBLIC_DIR = join(ROOT, "public");
const SRC_DIR = join(PUBLIC_DIR, "assets");
const OUT_DIR = join(PUBLIC_DIR, "img");
const MANIFEST = join(ROOT, "src/generated/media-manifest.json");
const CACHE = join(OUT_DIR, "media-cache.json");
const WIDTHS = [480, 960, 1600, 2400];
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".webm", ".m4v"]);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

const hashOf = async (file) => createHash("sha1").update(await readFile(file)).digest("hex");
const toPublic = (path) => "/" + relative(PUBLIC_DIR, path);
const fromPublic = (path) => join(PUBLIC_DIR, path.slice(1));

/** Every file a manifest entry points to; used to check that cached output still exists. */
function outputsOf(entry) {
  const base = fromPublic(entry.type === "video" ? entry.posterBase : entry.base);
  return entry.widths.flatMap((w) => [`${base}-${w}.avif`, `${base}-${w}.webp`]);
}

/** Finds ffmpeg for video posters. Without it, videos simply show their own first frame. */
function findFfmpeg() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return "ffmpeg";
  } catch {
    return null;
  }
}

async function processImage(input, outBase) {
  const meta = await sharp(input).rotate().metadata();
  // Width/height after EXIF rotation, so portrait phone photos are measured the right way up.
  const rotated = (meta.orientation ?? 1) >= 5;
  const width = rotated ? meta.height : meta.width;
  const height = rotated ? meta.width : meta.height;
  const widths = WIDTHS.filter((w) => w < width);
  widths.push(Math.min(width, WIDTHS[WIDTHS.length - 1]));
  const unique = [...new Set(widths)].sort((a, b) => a - b);
  for (const w of unique) {
    const pipeline = () => sharp(input).rotate().resize({ width: w, withoutEnlargement: true });
    await pipeline().avif({ quality: 58, effort: 4 }).toFile(`${outBase}-${w}.avif`);
    await pipeline().webp({ quality: 80 }).toFile(`${outBase}-${w}.webp`);
  }
  const lqipBuf = await sharp(input).rotate().resize({ width: 16 }).blur(1).webp({ quality: 40 }).toBuffer();
  return {
    width,
    height,
    widths: unique,
    lqip: `data:image/webp;base64,${lqipBuf.toString("base64")}`,
  };
}

async function main() {
  const files = (await walk(SRC_DIR)).sort();
  const cache = await readJson(CACHE, {});
  const nextCache = {};
  const manifest = {};
  const ffmpeg = findFfmpeg();
  const skippedVideos = [];
  let processed = 0;

  const queue = [...files];
  const workers = Array.from({ length: Math.max(2, os.cpus().length - 1) }, async () => {
    while (queue.length) {
      const file = queue.shift();
      const ext = extname(file).toLowerCase();
      const isImage = IMAGE_EXT.has(ext);
      const isVideo = VIDEO_EXT.has(ext);
      if (!isImage && !isVideo) continue;

      const rel = toPublic(file);
      const hash = await hashOf(file);
      const cached = cache[rel];
      if (cached && cached.hash === hash && outputsOf(cached.entry).every((f) => existsSync(f))) {
        manifest[rel] = cached.entry;
        nextCache[rel] = cached;
        continue;
      }

      const outBase = join(OUT_DIR, relative(SRC_DIR, dirname(file)), basename(file, extname(file)));
      await mkdir(dirname(outBase), { recursive: true });
      let entry;
      if (isImage) {
        entry = { type: "image", base: toPublic(outBase), ...(await processImage(file, outBase)) };
      } else if (ffmpeg) {
        // Grab a frame one second in as the poster, then treat it like an image.
        const posterSrc = `${outBase}-poster.png`;
        execFileSync(ffmpeg, ["-y", "-loglevel", "error", "-ss", "1", "-i", file, "-frames:v", "1", posterSrc]);
        entry = { type: "video", posterBase: toPublic(`${outBase}-poster`), ...(await processImage(posterSrc, `${outBase}-poster`)) };
      } else {
        skippedVideos.push(rel);
        continue;
      }
      manifest[rel] = entry;
      nextCache[rel] = { hash, entry };
      processed++;
      process.stdout.write(".");
    }
  });
  await Promise.all(workers);

  const sortKeys = (obj) => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
  await mkdir(dirname(MANIFEST), { recursive: true });
  await writeFile(MANIFEST, JSON.stringify(sortKeys(manifest), null, 1));
  await writeFile(CACHE, JSON.stringify(sortKeys(nextCache), null, 1));
  console.log(`\nmedia: ${Object.keys(manifest).length} files ready (${processed} newly processed)`);
  if (skippedVideos.length) {
    console.log(`media: ffmpeg not found, so these videos have no poster (they show their first frame instead):\n  ${skippedVideos.join("\n  ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
