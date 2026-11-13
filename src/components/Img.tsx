import { useState, type CSSProperties } from "react";
import { manifest } from "../content";

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
  if (!entry) return <img src={src} alt={alt} className={className} style={style} loading="lazy" />;

  const base = entry.type === "video" ? entry.posterBase! : entry.base!;
  const set = (ext: string) => entry.widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(", ");
  const fallbackWidth = entry.widths.find((w) => w >= 960) ?? entry.widths[entry.widths.length - 1];

  return (
    <picture className={className} style={style}>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
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
