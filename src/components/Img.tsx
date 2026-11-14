import { useState, type CSSProperties } from "react";
import { manifest } from "../content";
import { IS_PREVIEW_BUILD, availableWidths, mediaUrl } from "../lib/paths";

type Props = {
  src: string;
  alt: string;
  /** The `sizes` attribute: how wide the image renders, so the browser picks a sensible file. */
  sizes: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
};

/**
 * Responsive image: AVIF → WebP → fallback, with a blurred placeholder while loading.
 * Works for both photos and video posters (looked up by the original file path).
 */
export function Img({ src, alt, sizes, className, style, priority }: Props) {
  const entry = manifest[src];
  const [loaded, setLoaded] = useState(false);
  if (!entry) return <img src={mediaUrl(src)} alt={alt} className={className} style={style} loading="lazy" />;

  const base = mediaUrl(entry.type === "video" ? entry.posterBase! : entry.base!);
  const widths = availableWidths(entry.widths);
  const set = (ext: string) => widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(", ");
  const fallbackWidth = widths[0];

  return (
    <picture className={className} style={style}>
      {!IS_PREVIEW_BUILD && <source type="image/avif" srcSet={set("avif")} sizes={sizes} />}
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img
        src={`${base}-${fallbackWidth}.webp`}
        alt={alt}
        width={entry.width}
        height={entry.height}
        loading={priority ? "eager" : "lazy"}
        {...{ fetchpriority: priority ? "high" : "auto" }}
        decoding="async"
        onLoad={() => setLoaded(true)}
        draggable={false}
        className={loaded ? "img is-loaded" : "img"}
        style={{ backgroundImage: `url(${entry.lqip})` }}
      />
    </picture>
  );
}
