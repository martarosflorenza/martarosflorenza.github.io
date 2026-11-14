import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { categoryLabel, coverOf, pad, profile, projects, type Project } from "../content";
import { Page } from "../components/PageTransition";
import { Img } from "../components/Img";
import { Reveal } from "../components/Reveal";
import { Footer } from "../components/Footer";
import { Draw } from "../components/doodles/Draw";
import { Button, PushPin, SafetyPin } from "../components/doodles/Doodles";
import "./home.css";

export function Home() {
  const cover = profile.homeCover;
  const heroRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  // The thread stitches its way down from the safety pin as you scroll.
  const threadProgress = useTransform(scrollYProgress, [0, 0.9], [0.08, 1]);

  return (
    <Page title={profile.seo.title}>
      <section ref={heroRef} className="hero grid" aria-labelledby="intro">
        <div className="hero-intro">
          <motion.h1
            id="intro"
            className="serif hero-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          >
            Fashion stylist, <em>between</em> {profile.location.toLowerCase().replace("&", "and")}.
          </motion.h1>
          <p className="hero-sub soft">editorial · runway · commercial</p>
        </div>

        <figure className="hero-cover">
          <Img src={cover.src} alt={cover.alt} sizes="(min-width: 768px) 40vw, 92vw" priority />
          <figcaption className="small soft hero-caption">
            <span className="italic serif" style={{ fontSize: 14, letterSpacing: 0 }}>{cover.title}</span>
            {profile.settings.showCredits && cover.credits.map((c) => (
              <span key={c.name}> — {c.role} {c.name}</span>
            ))}
          </figcaption>
        </figure>

        <div ref={pinRef} className="hero-pin">
          <SafetyPin style={{ width: "100%" }} />
        </div>
        <Button className="hero-button" delay={2.2} />
        <HeroThread heroRef={heroRef} pinRef={pinRef} progress={threadProgress} />
      </section>

      <ProjectIndex />
      <Footer />
    </Page>
  );
}

/**
 * A red thread that starts at the safety pin's coil, loops once and runs down towards
 * the index. It is drawn in real pixels (measured), and is stitched *behind* the cover.
 */
function HeroThread({ heroRef, pinRef, progress }: { heroRef: RefObject<HTMLElement>; pinRef: RefObject<HTMLDivElement>; progress: MotionValue<number> }) {
  const [geo, setGeo] = useState<{ w: number; h: number; sx: number; sy: number } | null>(null);
  useLayoutEffect(() => {
    const hero = heroRef.current;
    const pin = pinRef.current;
    if (!hero || !pin) return;
    const measure = () => {
      const hr = hero.getBoundingClientRect();
      const pr = pin.getBoundingClientRect();
      setGeo({ w: hr.width, h: hr.height, sx: pr.left - hr.left + pr.width * 0.42, sy: pr.top - hr.top + pr.height * 0.95 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(hero);
    ro.observe(pin);
    return () => ro.disconnect();
  }, [heroRef, pinRef]);
  if (!geo) return null;
  const { w, h, sx, sy } = geo;
  const lx = Math.max(sx - w * 0.12, w * 0.1); // where the loop sits
  const ly = sy + h * 0.1;
  const d = [
    `M ${sx} ${sy}`,
    `C ${sx} ${sy + h * 0.06}, ${lx + w * 0.06} ${ly + h * 0.06}, ${lx} ${ly + h * 0.04}`,
    `C ${lx - w * 0.05} ${ly + h * 0.02}, ${lx - w * 0.02} ${ly - h * 0.06}, ${lx + w * 0.02} ${ly - h * 0.01}`,
    `C ${lx + w * 0.06} ${ly + h * 0.05}, ${w * 0.5} ${h * 0.96}, ${w * 0.22} ${h * 0.92}`,
    `C ${w * 0.08} ${h * 0.9}, ${w * 0.03} ${h * 0.96}, ${w * 0.03} ${h + 40}`,
  ].join(" ");
  return (
    <svg className="hero-thread" viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <Draw d={d} stroke="var(--thread)" strokeWidth={1.2} progress={progress} />
    </svg>
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
        <h2 id="index-title" className="small soft">index <span className="serif italic">({projects.length})</span></h2>
        <span className="small soft index-col-cat">category</span>
        <span className="small soft index-col-year">year</span>
      </div>
      <hr className="stitch" style={{ marginInline: "var(--margin)" }} />
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
                <span className="index-thumb" aria-hidden="true">
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
              className="index-preview-card"
              initial={{ opacity: 0, rotate: reduce ? 0 : -3, scale: 0.96 }}
              animate={{ opacity: 1, rotate: reduce ? 0 : -1.5, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 0.68, 0.18, 1] }}
            >
              <Img src={coverOf(hovered).src} alt="" sizes="280px" />
              <motion.span
                className="index-preview-pin"
                initial={{ y: reduce ? 0 : -24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.12, type: "spring", stiffness: 500, damping: 18 }}
              >
                <PushPin />
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
