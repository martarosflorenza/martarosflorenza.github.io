import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";

/** Gentle fade-and-rise when an element scrolls into view (fade only with reduced motion). */
export function Reveal({ children, delay = 0, className, style, as = "div" }: { children: ReactNode; delay?: number; className?: string; style?: CSSProperties; as?: "div" | "li" | "figure" }) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      style={style}
      initial={{ opacity: 0, y: reduce ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 0.68, 0.18, 1] }}
    >
      {children}
    </Comp>
  );
}
