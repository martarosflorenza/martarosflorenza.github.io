import { AnimatePresence, MotionConfig } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { PencilFilter } from "./components/doodles/PencilFilter";
import { Home } from "./pages/Home";
import { Project } from "./pages/Project";
import { Work } from "./pages/Work";
import { Info } from "./pages/Info";
import { NotFound } from "./pages/NotFound";

export function App() {
  const location = useLocation();
  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="skip-link">Skip to content</a>
      <PencilFilter />
      <Header />
      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:slug" element={<Project />} />
          <Route path="/info" element={<Info />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </MotionConfig>
  );
}
