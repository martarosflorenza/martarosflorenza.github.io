import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { categoryLabel, coverOf, isHorizontalVideo, pad, profile, type Project, projects } from "../content";
import { Page } from "../components/PageTransition";
import { Img } from "../components/Img";
import { Reveal } from "../components/Reveal";
import { Footer } from "../components/Footer";
import "./home.css";

export function Home() {
  const cover = profile.homeCover;

  return (
    <Page title={profile.seo.title}>
      <section className="hero grid" aria-labelledby="intro">
        {/* No visible headline: the cover photo leads. The heading stays for screen readers. */}
        <h1 id="intro" className="sr-only">{profile.name}, {profile.role.toLowerCase()} based in {profile.location}</h1>

        <figure className="hero-cover">
          <Img src={cover.src} alt={cover.alt} sizes="(min-width: 768px) 66vw, 100vw" priority />
          <figcaption className="hero-caption">
            {cover.title}
            {profile.settings.showCredits && cover.credits.map((c) => (
              <span key={c.name} className="hero-caption-by">by {c.name}</span>
            ))}
          </figcaption>
        </figure>
      </section>

      <ProjectIndex />
      <Footer />
    </Page>
  );
}

function ProjectIndex() {
  const [hovered, setHovered] = useState<Project | null>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 160, damping: 22 });
  const sy = useSpring(y, { stiffness: 160, damping: 22 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  return (
    <section className="index" aria-labelledby="index-title">
      <div className="grid index-head">
        <h2 id="index-title" className="small soft">projects ({projects.length})</h2>
        <span className="small soft index-col-cat">category</span>
        <span className="small soft index-col-year">year</span>
      </div>
      <hr className="rule" style={{ marginInline: "var(--margin)" }} />
      <ol className={hovered ? "index-list has-hover" : "index-list"} onPointerLeave={() => setHovered(null)}>
        {projects.map((p, i) => {
          const cover = coverOf(p);
          return (
            <Reveal as="li" key={p.slug} delay={Math.min(i, 8) * 0.03}>
              <Link
                to={`/work/${p.slug}`}
                className={hovered?.slug === p.slug ? "index-row grid is-active" : "index-row grid"}
                onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(p)}
                onFocus={() => setHovered(null)}
              >
                <span className="index-num small soft">{pad(i + 1)}</span>
                <span className={isHorizontalVideo(p) ? "index-thumb is-video" : "index-thumb"} aria-hidden="true">
                  <Img src={cover.src} alt="" sizes="64px" className="fill" />
                </span>
                <span className="index-title serif">{p.title}</span>
                <span className="index-cat soft">{categoryLabel(p.category).toLowerCase()}</span>
                <span className="index-year soft">{p.year}</span>
              </Link>
            </Reveal>
          );
        })}
      </ol>

      {/* Floating preview that follows the pointer (desktop only). */}
      <motion.div className="index-preview" style={{ x: sx, y: sy }} aria-hidden="true">
        <AnimatePresence mode="popLayout">
          {hovered && (
            <motion.div
              key={hovered.slug}
              className={isHorizontalVideo(hovered) ? "index-preview-card is-video" : "index-preview-card"}
              initial={{ opacity: 0, rotate: reduce ? 0 : -3, scale: 0.96 }}
              animate={{ opacity: 1, rotate: reduce ? 0 : -1.5, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 0.68, 0.18, 1] }}
            >
              <Img src={coverOf(hovered).src} alt="" sizes="280px" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
