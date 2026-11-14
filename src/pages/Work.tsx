import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { categories, categoryLabel, coverOf, pad, profile, projects } from "../content";
import { Page } from "../components/PageTransition";
import { Img } from "../components/Img";
import { Reveal } from "../components/Reveal";
import { Footer } from "../components/Footer";
import "./work.css";

export function Work() {
  const [filter, setFilter] = useState<string>("all");
  const shown = filter === "all" ? projects : projects.filter((p) => p.category === filter);
  const filters = [{ slug: "all", label: "all", count: projects.length }].concat(
    categories.map((c) => ({ slug: c.slug, label: c.label.toLowerCase(), count: projects.filter((p) => p.category === c.slug).length })),
  );

  return (
    <Page title={`Work — ${profile.name}`}>
      <div className="work">
        <div className="work-head grid">
          <h1 className="serif work-title">Work</h1>
          <ul className="work-filters" aria-label="Filter projects by category">
            {filters.map((f) => (
              <li key={f.slug}>
                <button onClick={() => setFilter(f.slug)} aria-pressed={filter === f.slug} className="work-filter">
                  <span className="bracket">{f.label}</span> <span className="count">{f.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <AnimatePresence mode="wait">
          <motion.ol
            key={filter}
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
                  <Link to={`/work/${p.slug}`} className="work-card">
                    <span className="work-card-img">
                      <Img src={cover.src} alt="" sizes="(min-width: 900px) 33vw, 50vw" />
                    </span>
                    <span className="work-card-meta">
                      <span className="small soft">{pad(projects.indexOf(p) + 1)}</span>
                      <span className="serif work-card-title">{p.title}</span>
                      <span className="small soft">
                        {categoryLabel(p.category).toLowerCase()}, {p.year}
                        {p.media.some((m) => m.type === "video") ? " · film" : ""}
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
