import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "../content";
import { manifest } from "../content";
import { availableWidths, mediaUrl } from "../lib/paths";

const SHORT_CLIP = 60; // seconds; shorter clips loop silently like moving photographs

/**
 * Plays the original video file untouched (no re-encoding, full quality).
 * Short clips autoplay muted in a loop while active, with a sound toggle.
 * Longer films wait for the viewer and show native controls.
 */
export function Video({ media, active, className }: { media: MediaItem; active: boolean; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const entry = manifest[media.src];
  const poster = entry?.posterBase ? mediaUrl(`${entry.posterBase}-${availableWidths(entry.widths)[0]}.webp`) : undefined;
  const isShort = (media.duration ?? 0) <= SHORT_CLIP;
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active && isShort) v.play().catch(() => {});
    else v.pause();
  }, [active, isShort]);

  return (
    <div className={className} style={{ position: "relative", width: "100%", height: "100%" }}>
      <video
        ref={ref}
        src={mediaUrl(media.src)}
        poster={poster}
        width={media.width}
        height={media.height}
        muted={isShort ? muted : false}
        loop={isShort}
        playsInline
        controls={!isShort}
        // Without a poster, load just enough to show the first frame.
        preload={active ? "auto" : poster ? "none" : "metadata"}
        aria-label={media.alt}
        style={{ width: "100%", height: "100%", objectFit: "contain", background: "var(--paper-deep)" }}
      />
      {isShort && (
        <button className="video-sound small bracket" onClick={() => setMuted((m) => !m)} aria-pressed={!muted}>
          {muted ? "sound off" : "sound on"}
        </button>
      )}
    </div>
  );
}
