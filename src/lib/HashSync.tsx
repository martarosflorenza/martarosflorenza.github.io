import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Preview build only: map routes to simple hashes ("#vanguard", "#info") and back,
// so a link to a single project can be shared and the back button keeps working.
const toHash = (path: string) => (path === "/" ? "" : path.replace(/^\/work\/?/, "").replace(/^\//, "") || "work");
const toPath = (hash: string) => {
  const h = hash.replace(/^#/, "");
  if (!h) return "/";
  if (h === "work" || h === "info") return `/${h}`;
  return `/work/${h}`;
};

export const initialPreviewPath = () => toPath(window.location.hash);

export function HashSync() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const target = toHash(location.pathname);
    if (window.location.hash.replace(/^#/, "") !== target) {
      window.location.hash = target;
    }
  }, [location.pathname]);
  useEffect(() => {
    const onHash = () => {
      const path = toPath(window.location.hash);
      if (path !== location.pathname) navigate(path);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [location.pathname, navigate]);
  return null;
}
