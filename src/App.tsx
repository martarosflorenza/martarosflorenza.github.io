import { AnimatePresence, MotionConfig } from "framer-motion";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import { Header } from "./components/Header";
import { isCategory } from "./content";
import { trackPath } from "./lib/scrollMemory";
import { Home } from "./pages/Home";
import { Project } from "./pages/Project";
import { Work } from "./pages/Work";
import { Info } from "./pages/Info";
import { NotFound } from "./pages/NotFound";

/** /work/<name> is a category overview when <name> is a category, otherwise a project. */
function WorkOrProject() {
  const { slug = "" } = useParams();
  return isCategory(slug) ? <Work category={slug} /> : <Project />;
}

/** All overview pages share one key, so switching category fades the grid instead of replaying the page transition. */
function routeKey(pathname: string) {
  const [, first, second] = pathname.split("/");
  if (first === "work" && (!second || isCategory(second))) return "work";
  return pathname;
}

export function App() {
  const location = useLocation();
  trackPath(location.pathname + location.search);
  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="skip-link">Skip to content</a>
      <Header />
      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
        <Routes location={location} key={routeKey(location.pathname)}>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:slug" element={<WorkOrProject />} />
          <Route path="/info" element={<Info />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </MotionConfig>
  );
}
