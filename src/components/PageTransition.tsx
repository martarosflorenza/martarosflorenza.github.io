import { motion, useReducedMotion } from "framer-motion";
import { useEffect, type ReactNode } from "react";

const EASE = [0.65, 0, 0.35, 1] as const;

/**
 * Each route is wrapped in this. On enter, the new page is revealed with a soft
 * left-to-right mask. On exit, the old page
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
  );
}

