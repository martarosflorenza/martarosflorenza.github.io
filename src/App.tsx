import { AnimatePresence, MotionConfig } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { CursorProvider } from "./components/Cursor";
import { PencilFilter } from "./components/doodles/PencilFilter";
import { Home } from "./pages/Home";
import { Project } from "./pages/Project";
import { Placeholder } from "./pages/Placeholder";
import { NotFound } from "./pages/NotFound";

export function App() {
  const location = useLocation();
  return (
    <MotionConfig reducedMotion="user">
      <CursorProvider>
        <a href="#main" className="skip-link">Skip to content</a>
        <PencilFilter />
        <Header />
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/work" element={<Placeholder name="Work" />} />
            <Route path="/work/:slug" element={<Project />} />
            <Route path="/info" element={<Placeholder name="Info" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </CursorProvider>
    </MotionConfig>
  );
}
