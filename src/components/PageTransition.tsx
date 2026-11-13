import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

const EASE = [0.65, 0, 0.35, 1] as const;

/**
 * Each route is wrapped in this. On enter, a red thread is pulled across the screen
 * and the new page is revealed behind it (a left-to-right mask). On exit, the old page
 * simply fades. With reduced motion it becomes a plain crossfade.
 * No transforms are used on the wrapper, so fixed elements inside pages keep working.
 */
export function Page({ children, title }: { children: ReactNode; title: string }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    document.title = title;
  }, [title]);

  if (reduce) {
    return (
      <motion.main id="main" className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
        {children}
      </motion.main>
    );
  }

  return (
    <>
      <motion.main
        id="main"
        className="page"
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)", transitionEnd: { clipPath: "none" } }}
        exit={{ opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.05 }}
      >
        {children}
      </motion.main>
      <ThreadWipe />
    </>
  );
}

/** The thread that leads the page reveal, drawn in real pixels so the stroke stays even. */
function ThreadWipe() {
  const [{ w, h }] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const d = `M -20 ${h * 0.4} C ${w * 0.18} ${h * 0.36}, ${w * 0.3} ${h * 0.62}, ${w * 0.5} ${h * 0.52} C ${w * 0.64} ${h * 0.45}, ${w * 0.7} ${h * 0.3}, ${w * 0.8} ${h * 0.44} C ${w * 0.88} ${h * 0.56}, ${w * 0.94} ${h * 0.5}, ${w + 20} ${h * 0.46}`;
  return (
    <motion.div className="thread-wipe" aria-hidden="true" initial={{ opacity: 1 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.9, duration: 0.35 }}>
      <svg viewBox={`0 0 ${w} ${h}`}>
        <motion.path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.95, ease: EASE }}
        />
      </svg>
    </motion.div>
  );
}
