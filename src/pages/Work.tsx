import type { CSSProperties } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { categories, categoryLabel, categoryPath, coverOf, pad, profile, projects } from "../content";
import { Page } from "../components/PageTransition";
import { Img } from "../components/Img";
import { Reveal } from "../components/Reveal";
import { Footer } from "../components/Footer";
import { useListingScroll } from "../lib/scrollMemory";
import "./work.css";

/** The overview of all projects (/work) or of one category (/work/<category>). */
export function Work({ category }: { category?: string }) {
  const path = categoryPath(category);
  useListingScroll(path);
  const shown = category ? projects.filter((p) => p.category === category) : projects;
  const filters = [{ slug: null as string | null, label: "all", count: projects.length }].concat(
    categories.map((c) => ({ slug: c.slug, label: c.label.toLowerCase(), count: projects.filter((p) => p.category === c.slug).length })),
  );
  const title = category ? `${categoryLabel(category)} — Work — ${profile.name}` : `Work — ${profile.name}`;

  return (
    <Page title={title}>
      <div className="work">
        <div className="work-head grid">
          <h1 className="serif work-title">Work</h1>
          <nav className="work-filters" aria-label="Project categories">
            {filters.map((f) => (
              <NavLink key={f.label} to={categoryPath(f.slug)} end className="work-filter">
                <span className="bracket">{f.label}</span> <span className="count">{f.count}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <AnimatePresence mode="wait">
          <motion.ol
            key={path}
            className="work-grid grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {shown.map((p, i) => {
              const cover = coverOf(p);
              return (
                <Reveal as="li" key={p.slug} className="work-item" delay={(i % 3) * 0.08}>
                  <Link to={`/work/${p.slug}?from=${category ?? "all"}`} className="work-card">
                    <span className="work-card-img" style={{ "--ratio": cover.width / cover.height } as CSSProperties}>
                      <Img src={cover.src} alt="" sizes="(min-width: 900px) 33vw, 50vw" />
                    </span>
                    <span className="work-card-meta">
                      <span className="small soft">{pad(projects.indexOf(p) + 1)}</span>
                      <span className="serif work-card-title">{p.title}</span>
                      <span className="small soft">
                        {categoryLabel(p.category).toLowerCase()}, {p.year}
                      </span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </motion.ol>
        </AnimatePresence>
      </div>
      <Footer />
    </Page>
  );
}
