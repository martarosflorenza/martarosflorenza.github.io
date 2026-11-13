import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { Needle } from "./doodles/Doodles";

type CursorApi = { setLabel: (label: string | null) => void };
const CursorContext = createContext<CursorApi>({ setLabel: () => {} });
export const useCursor = () => useContext(CursorContext);

const TAIL = 18; // number of points in the trailing thread

/**
 * A small needle that follows the pointer with a short red thread trailing behind.
 * It keeps the native cursor (so nothing is hidden from the user), fades out when the
 * pointer rests, hides itself over the work ([data-cursor="hide"]) and can show a
 * text label instead (e.g. "next →" over a gallery).
 * Desktop pointers only, and disabled entirely when reduced motion is requested.
 */
export function CursorProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [label, setLabelState] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [idle, setIdle] = useState(true);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 420, damping: 40, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 420, damping: 40, mass: 0.6 });

  const pathRef = useRef<SVGPathElement>(null);
  const points = useRef<{ x: number; y: number }[]>([]);
  const idleTimer = useRef<number>();

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (hover: hover)");
    const update = () => setEnabled(mq.matches && !reduce);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduce]);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as Element | null;
      setHidden(!!target?.closest?.('[data-cursor="hide"]'));
      setIdle(false);
      window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setIdle(true), 1400);
    };
    const onLeave = () => setIdle(true);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    // The thread tail follows the needle's eye with a little lag, redrawn every frame.
    let raf = 0;
    const tick = () => {
      const head = { x: sx.get() + 30, y: sy.get() + 22 };
      const pts = points.current;
      pts.unshift(head);
      if (pts.length > TAIL) pts.length = TAIL;
      for (let i = 1; i < pts.length; i++) {
        pts[i] = { x: pts[i].x + (pts[i - 1].x - pts[i].x) * 0.35, y: pts[i].y + (pts[i - 1].y - pts[i].y) * 0.35 + 0.6 };
      }
      if (pathRef.current && pts.length > 2) {
        let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
        for (let i = 1; i < pts.length - 1; i++) {
          const mx = (pts[i].x + pts[i + 1].x) / 2;
          const my = (pts[i].y + pts[i + 1].y) / 2;
          d += ` Q${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
        }
        pathRef.current.setAttribute("d", d);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
      window.clearTimeout(idleTimer.current);
    };
  }, [enabled, x, y, sx, sy]);

  const setLabel = useCallback((l: string | null) => setLabelState(l), []);
  const showNeedle = enabled && !hidden && !label && !idle;

  return (
    <CursorContext.Provider value={{ setLabel }}>
      {children}
      {enabled && (
        <>
          <motion.svg className="cursor-layer" aria-hidden="true" animate={{ opacity: showNeedle ? 1 : 0 }} transition={{ duration: 0.4 }}>
            <path ref={pathRef} fill="none" stroke="var(--thread)" strokeWidth="1" strokeLinecap="round" />
          </motion.svg>
          <motion.div
            className="cursor-layer"
            aria-hidden="true"
            style={{ x: sx, y: sy, width: 40, height: 8, inset: "auto", left: 0, top: 0, color: "var(--ink)" }}
            animate={{ opacity: showNeedle ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ transform: "translate(12px, 14px) rotate(35deg)", transformOrigin: "0 50%" }}>
              <Needle style={{ width: 34 }} />
            </div>
          </motion.div>
          <AnimatePresence>
            {label && (
              <motion.div
                key="label"
                className="cursor-label"
                style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {label}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </CursorContext.Provider>
  );
}
