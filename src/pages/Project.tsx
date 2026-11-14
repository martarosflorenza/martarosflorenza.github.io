import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { categoryLabel, categoryPath, coverOf, creditLine, getProject, isCategory, neighbours, pad, primaryName, profile, projectFacts, redirects, type MediaItem, type Project as ProjectT } from "../content";
import { Page } from "../components/PageTransition";
import { Img } from "../components/Img";
import { Video } from "../components/Video";
import { Reveal } from "../components/Reveal";
import { Footer } from "../components/Footer";
import { useMediaQuery, useViewport } from "../lib/hooks";
import { getPreviousPath, RESTORE_STATE } from "../lib/scrollMemory";
import { NotFound } from "./NotFound";
import "./project.css";

const EASE = [0.22, 0.68, 0.18, 1] as const;

export function Project() {
  const { slug = "" } = useParams();
  const { search } = useLocation();
  const wide = useMediaQuery("(min-width: 900px)");
  // Renamed projects: send old addresses to the new one.
  if (redirects[slug]) return <Navigate to={`/work/${redirects[slug]}${search}`} replace />;
  const project = getProject(slug);
  if (!project) return <NotFound />;
  return (
    <Page title={`${project.title} — ${profile.name}`}>
      {project.youtubeId ? (
        <VideoProject key={project.slug} project={project} />
      ) : wide ? (
        <WideProject key={project.slug} project={project} />
      ) : (
        <NarrowProject key={project.slug} project={project} />
      )}
    </Page>
  );
}

/** Where "back" leads: the overview the visitor came from (?from=), else the project's own category. */
function useBackTarget(project: ProjectT) {
  const [params] = useSearchParams();
  const from = params.get("from");
  const to = from === "all" ? categoryPath(null) : categoryPath(from && isCategory(from) ? from : project.category);
  const label = to === categoryPath(null) ? "all work" : categoryLabel(to.split("/")[2]).toLowerCase();
  return { to, label };
}

/**
 * Back to the overview. When that overview is the previous page, this is the same step as the
 * browser's back button; otherwise it opens the overview at its remembered scroll position.
 */
function BackLink({ project }: { project: ProjectT }) {
  const { to, label } = useBackTarget(project);
  const navigate = useNavigate();
  return (
    <Link
      to={to}
      state={RESTORE_STATE}
      className="back-link link-line"
      onClick={(e) => {
        if (getPreviousPath() === to) {
          e.preventDefault();
          navigate(-1);
        }
      }}
    >
      ← {label}
    </Link>
  );
}

/** The next project keeps the visitor's ?from=, so "back" still returns to the same overview. */
function useNextHref(next: ProjectT) {
  const { search } = useLocation();
  return `/work/${next.slug}${search}`;
}

function TitleBlock({ project }: { project: ProjectT }) {
  return (
    <div className="project-title">
      <p className="small soft">
        <BackLink project={project} /> — {project.year}
      </p>
      <h1 className="serif">{project.title}</h1>
    </div>
  );
}

/* ---------------- Desktop: horizontal, one image centred ---------------- */

function WideProject({ project }: { project: ProjectT }) {
  const media = project.media;
  const { next } = neighbours(project.slug);
  const nextHref = useNextHref(next);
  const navigate = useNavigate();
  const { w: vw, h: vh } = useViewport();
  const [index, setIndex] = useState(0);
  const [panel, setPanel] = useState<"info" | "all" | null>(null);
  const endIndex = media.length; // the "next project" card after the last image

  // Layout: every slide shares one height, keeps its real ratio, never crops.
  const layout = useMemo(() => {
    const stageH = vh - 220;
    const H = Math.max(260, Math.min(stageH, 1100));
    const gap = Math.max(72, vw * 0.11);
    let left = 0;
    const slides = media.map((m) => {
      const ratio = m.width / m.height;
      const w = Math.min(H * ratio, vw * 0.64);
      const s = { left, w, h: w / ratio };
      left += w + gap;
      return s;
    });
    const endW = Math.max(240, vw * 0.24);
    slides.push({ left, w: endW, h: H });
    return { slides, H };
  }, [media, vw, vh]);

  const current = layout.slides[index];
  const x = vw / 2 - (current.left + current.w / 2);

  const go = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => {
        const n = i + dir;
        if (n > endIndex) {
          navigate(nextHref);
          return i;
        }
        return Math.max(0, n);
      });
    },
    [endIndex, navigate, nextHref],
  );

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (panel) {
        if (e.key === "Escape") setPanel(null);
        return;
      }
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, panel]);

  // Trackpad / wheel: one step per gesture.
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let acc = 0;
    let locked = false;
    let timer = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (locked) return;
      acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(acc) > 40) {
        go(acc > 0 ? 1 : -1);
        acc = 0;
        locked = true;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => (locked = false), 750);
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(timer);
    };
  }, [go]);

  const atEnd = index === endIndex;
  const isVideoActive = media[index]?.type === "video";

  return (
    <div className="wide-project">
      <TitleBlock project={project} />

      <p className="project-counter serif" aria-hidden="true">
        {atEnd ? "—" : `${pad(index + 1)} / ${pad(media.length)}`}
      </p>
      <p className="sr-only" aria-live="polite">
        {atEnd ? `End of ${project.title}. Next project: ${next.title}.` : `Image ${index + 1} of ${media.length}`}
      </p>

      <div className="stage" ref={stageRef}>
        <motion.div className="track" animate={{ x }} initial={false} transition={{ duration: 0.85, ease: EASE }}>
          {media.map((m, i) => (
            <Slide key={m.src} media={m} box={layout.slides[i]} active={i === index} near={Math.abs(i - index) <= 2} onSelect={() => setIndex(i)} />
          ))}
          <div className="slide end-card" style={{ left: layout.slides[endIndex].left, width: layout.slides[endIndex].w, height: layout.H }}>
            <Link to={nextHref} className="end-card-link">
              <span className="small soft">next project</span>
              <span className="serif end-card-title">{next.title}</span>
              <span className="end-card-thumb">
                <Img src={coverOf(next).src} alt="" sizes="160px" />
              </span>
            </Link>
          </div>
        </motion.div>

        {/* Invisible click zones: left half = previous, right half = next. */}
        <button
          className="zone zone-prev"
          aria-label="Previous image"
          disabled={index === 0}
          onClick={() => go(-1)}
        >
          <span className="zone-arrow" aria-hidden="true">←</span>
        </button>
        <button
          className="zone zone-next"
          aria-label={atEnd ? `Next project: ${next.title}` : "Next image"}
          onClick={() => go(1)}
          style={isVideoActive ? { width: "25%" } : undefined}
        >
          <span className="zone-arrow" aria-hidden="true">{atEnd ? "next project →" : "→"}</span>
        </button>
      </div>

      <div className="bottom-bar grid">
        <button className="bracket bb-left" onClick={() => setPanel(panel === "info" ? null : "info")} aria-expanded={panel === "info"}>
          information
        </button>
        <p className="bb-center">
          <CreditLine project={project} />
        </p>
        <button className="bracket bb-right" onClick={() => setPanel("all")} aria-haspopup="dialog">
          view all
        </button>
      </div>

      <AnimatePresence>
        {panel === "info" && <InfoPanel project={project} onClose={() => setPanel(null)} />}
        {panel === "all" && (
          <ViewAll
            project={project}
            onPick={(i) => {
              setIndex(i);
              setPanel(null);
            }}
            onClose={() => setPanel(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Slide({ media, box, active, near, onSelect }: { media: MediaItem; box: { left: number; w: number; h: number }; active: boolean; near: boolean; onSelect: () => void }) {
  return (
    <div className={active ? "slide is-active" : "slide"} style={{ left: box.left, width: box.w, height: box.h }} onClick={active ? undefined : onSelect}>
      {media.type === "video" ? (
        <Video media={media} active={active} />
      ) : (
        <Img src={media.src} alt={media.alt} sizes={`${Math.round(box.w)}px`} priority={active && near} className="fill-contain" />
      )}
    </div>
  );
}

function InfoPanel({ project, onClose }: { project: ProjectT; onClose: () => void }) {
  const reduce = useReducedMotion();
  return (
    <motion.aside
      className="info-panel"
      aria-label="Project information"
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduce ? 0 : 24 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <ProjectFacts project={project} />
      <button className="small bracket info-close" onClick={onClose}>close</button>
    </motion.aside>
  );
}

/** The line under the images: the custom caption, or role (+ note) followed by the publication/client/artist. */
function CreditLine({ project }: { project: ProjectT }) {
  if (project.caption) return <>{project.caption}</>;
  const name = primaryName(project);
  return (
    <>
      {creditLine(project).toLowerCase()} {name && <strong>{name.toLowerCase()}</strong>}
    </>
  );
}

/** Compact project information: a small thumbnail beside a short list of facts. */
function ProjectFacts({ project }: { project: ProjectT }) {
  const cover = coverOf(project);
  return (
    <div className="facts">
      <span className="facts-thumb">
        <Img src={cover.src} alt="" sizes="72px" />
      </span>
      <div>
        {project.description && <p className="facts-desc">{project.description}</p>}
        <dl>
          {projectFacts(project).map(([label, value]) => (
            <div key={label + value} className="facts-row">
              {label && <dt>{label}</dt>}
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function ViewAll({ project, onPick, onClose }: { project: ProjectT; onPick: (i: number) => void; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, []);
  return (
    <motion.div
      className="view-all"
      role="dialog"
      aria-modal="true"
      aria-label={`All images of ${project.title}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <ol className="view-all-grid">
        {project.media.map((m, i) => (
          <motion.li key={m.src} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.025, duration: 0.4 }}>
            <button onClick={() => onPick(i)} aria-label={`Show image ${i + 1}`}>
              <Img src={m.src} alt="" sizes="(min-width: 900px) 15vw, 30vw" />
              <span className="small soft">{pad(i + 1)}</span>
            </button>
          </motion.li>
        ))}
      </ol>
      <button ref={closeRef} className="bracket view-all-close" onClick={onClose}>close</button>
    </motion.div>
  );
}

/* ---------------- Mobile & tablet: a calm vertical sequence ---------------- */

function NarrowProject({ project }: { project: ProjectT }) {
  const { next } = neighbours(project.slug);
  const nextHref = useNextHref(next);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  return (
    <div className="narrow-project">
      <TitleBlock project={project} />
      <p className="narrow-credit soft"><CreditLine project={project} /></p>
      <ol className="narrow-list">
        {project.media.map((m, i) => (
          <Reveal as="li" key={m.src}>
            <figure>
              {m.type === "video" ? (
                <motion.div
                  style={{ aspectRatio: `${m.width} / ${m.height}` }}
                  onViewportEnter={() => setActiveVideo(m.src)}
                  onViewportLeave={() => setActiveVideo((v) => (v === m.src ? null : v))}
                  viewport={{ amount: 0.6 }}
                >
                  <Video media={m} active={activeVideo === m.src} />
                </motion.div>
              ) : (
                <span className="narrow-img" style={{ "--ratio": m.width / m.height } as CSSProperties}>
                  <Img src={m.src} alt={m.alt} sizes="100vw" priority={i === 0} />
                </span>
              )}
              <figcaption className="small soft">{pad(i + 1)} / {pad(project.media.length)}</figcaption>
            </figure>
          </Reveal>
        ))}
      </ol>
      <div className="narrow-facts">
        <ProjectFacts project={project} />
      </div>
      <Link to={nextHref} className="narrow-next">
        <span className="small soft">next project</span>
        <span className="serif">{next.title} →</span>
      </Link>
      <Footer />
    </div>
  );
}

/* ---------------- Video projects: embedded YouTube player first ---------------- */

/** Privacy-friendly YouTube embed (youtube-nocookie), playing on this site. */
function YouTube({ id, title }: { id: string; title: string }) {
  const src = `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
  return (
    <div className="yt-frame">
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}

/** The player at full content width, then the title and one short credit line. */
function VideoProject({ project }: { project: ProjectT }) {
  const { next } = neighbours(project.slug);
  const nextHref = useNextHref(next);
  return (
    <div className="video-project">
      <p className="small soft video-back">
        <BackLink project={project} /> — {project.year}
      </p>
      <YouTube id={project.youtubeId!} title={project.title} />
      <div className="video-text">
        <h1 className="serif video-title">{project.title}</h1>
        <p className="small soft video-credit"><CreditLine project={project} /></p>
        <div className="video-facts">
          <ProjectFacts project={project} />
        </div>
      </div>
      <Link to={nextHref} className="narrow-next">
        <span className="small soft">next project</span>
        <span className="serif">{next.title} →</span>
      </Link>
      <Footer />
    </div>
  );
}
