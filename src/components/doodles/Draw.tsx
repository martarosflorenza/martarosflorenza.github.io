import { motion, useReducedMotion, type MotionValue } from "framer-motion";
import type { SVGProps } from "react";

type DrawProps = Omit<SVGProps<SVGPathElement>, "ref" | "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"> & {
  d: string;
  delay?: number;
  duration?: number;
  /** Drive the drawing from a motion value (e.g. scroll progress) instead of time. */
  progress?: MotionValue<number>;
  /** Draw when scrolled into view rather than on mount. */
  inView?: boolean;
};

/** A single stroke that draws itself (stroke-dashoffset via Framer's pathLength). */
export function Draw({ d, delay = 0, duration = 1.4, progress, inView, ...rest }: DrawProps) {
  const reduce = useReducedMotion();
  const common = {
    d,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
  if (reduce) return <path {...common} />;
  if (progress) return <motion.path {...common} style={{ pathLength: progress }} />;
  const transition = { duration, delay, ease: [0.65, 0, 0.35, 1] as const };
  return inView ? (
    <motion.path
      {...common}
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={transition}
    />
  ) : (
    <motion.path {...common} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={transition} />
  );
}
