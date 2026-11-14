/**
 * Build-mode helpers. The normal site is served from the domain root.
 * The "artifact" preview build (npm run build:preview) is a single HTML page with
 * media next to it, so paths must be relative and only a reduced set of image sizes ships.
 */
export const IS_PREVIEW_BUILD = import.meta.env.VITE_PREVIEW_BUILD === "1";

/** Turn a site-root path ("/img/x.webp") into the right URL for the current build. */
export const mediaUrl = (path: string) => (IS_PREVIEW_BUILD ? path.replace(/^\//, "") : path);

/** In the preview build only two widths ship: ~960px and the largest up to 1600px. */
export function availableWidths(widths: number[]) {
  if (!IS_PREVIEW_BUILD) return widths;
  const small = widths.find((w) => w >= 960) ?? widths[widths.length - 1];
  const large = [...widths].reverse().find((w) => w <= 1600) ?? small;
  return [...new Set([small, large])].sort((a, b) => a - b);
}
