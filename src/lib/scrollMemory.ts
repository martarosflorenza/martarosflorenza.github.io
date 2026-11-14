// Remembers the scroll position of overview pages (/work and /work/<category>) so that
// returning from a project, with the browser's back button or the on-page back link,
// lands where the visitor left off.
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const storageKey = (path: string) => `scroll:${path}`;

// The current and previous in-app addresses (path + search). Updated synchronously while
// rendering, so scroll events fired during a page transition are never saved for the
// page that is leaving.
let currentPath = "";
let previousPath = "";

/** Called by the app on every render with the current address. */
export function trackPath(path: string) {
  if (path === currentPath) return;
  previousPath = currentPath;
  currentPath = path;
}

/** The address the visitor was on just before the current one (inside this site). */
export const getPreviousPath = () => previousPath;

function readSaved(path: string): number | null {
  try {
    const value = sessionStorage.getItem(storageKey(path));
    return value === null ? null : Number(value) || 0;
  } catch {
    return null;
  }
}

function save(path: string, y: number) {
  try {
    sessionStorage.setItem(storageKey(path), String(Math.round(y)));
  } catch {
    // Storage unavailable (private mode): the page simply opens at the top.
  }
}

/** State passed by the back link so the overview restores its position like the browser back button. */
export const RESTORE_STATE = { restoreScroll: true } as const;

/**
 * Saves the scroll position of an overview page while the visitor scrolls, and restores it
 * when the page is reached by going back (browser back/forward, or the project back link).
 * Restoring waits until the page is tall enough, i.e. until the images have laid out.
 */
export function useListingScroll(path: string) {
  const navigationType = useNavigationType();
  const location = useLocation();
  const wantsRestore = navigationType === "POP" || (location.state as { restoreScroll?: boolean } | null)?.restoreScroll === true;
  // Read before any scroll event on this visit can overwrite the stored value.
  const target = useMemo(() => (wantsRestore ? readSaved(path) : null), [path]);
  const restoring = useRef(false);

  useLayoutEffect(() => {
    restoring.current = target !== null && target > 0;
  }, [target]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (restoring.current || currentPath.split("?")[0] !== path) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!restoring.current && currentPath.split("?")[0] === path) save(path, window.scrollY);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [path]);

  useEffect(() => {
    if (target === null || target <= 0) return;
    let frame = 0;
    let tries = 0;
    const started = performance.now();
    const tick = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // Give images up to two seconds to lay out; then scroll as far as possible.
      if (max >= target || performance.now() - started > 2000) {
        window.scrollTo(0, Math.min(target, Math.max(0, max)));
        // Re-apply once more on the next frame in case a transition reset the position.
        if (tries++ < 1) {
          frame = requestAnimationFrame(tick);
          return;
        }
        restoring.current = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      restoring.current = false;
    };
  }, [target]);
}
