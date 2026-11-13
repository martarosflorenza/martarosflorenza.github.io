// Original line drawings of a stylist's tools. Strokes use currentColor,
// so colour them with CSS `color`. All are decorative (aria-hidden).
import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { Draw } from "./Draw";

type DoodleProps = { className?: string; style?: CSSProperties; delay?: number; inView?: boolean };

/** Large sketchy safety pin, drawn with several loose passes like a quick pencil study. */
export function SafetyPin({ className, style, delay = 0.2, inView }: DoodleProps) {
  const reduce = useReducedMotion();
  const passes = [
    // Coil
    "M101 487 C 80 503, 92 538, 121 535 C 149 532, 155 497, 134 483 C 117 472, 97 481, 100 498 C 103 514, 124 520, 136 508",
    // Back wire
    "M103 479 C 99 380, 92 250, 84 112",
    "M108 476 C 104 380, 97 260, 90 116",
    // Pin (front wire) ending in a point inside the clasp
    "M134 484 C 141 380, 149 250, 156 132",
    // Clasp
    "M78 116 C 70 74, 82 44, 116 40 C 152 36, 178 56, 176 94 C 175 120, 163 136, 151 131 C 139 126, 145 103, 159 107",
    "M80 118 C 96 128, 142 132, 170 121",
    "M84 112 C 88 92, 102 76, 124 74 C 142 73, 154 84, 155 100",
    // Shading strokes on the clasp
    "M96 58 C 104 54, 112 52, 120 52",
    "M150 62 C 156 68, 160 76, 161 84",
  ];
  return (
    <motion.svg
      viewBox="40 20 160 540"
      className={className}
      style={{ transformOrigin: "50% 8%", ...style }}
      aria-hidden="true"
      animate={reduce ? undefined : { rotate: [-1.2, 1.2, -1.2] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    >
      <g filter="url(#pencil)">
        {passes.map((d, i) => (
          <Draw key={i} d={d} delay={delay + i * 0.18} duration={1.1} inView={inView} strokeWidth={2.4} />
        ))}
      </g>
    </motion.svg>
  );
}

/** A small sewing needle. The point is at the left; the eye at the right. */
export function Needle({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 80 14" className={className} style={style} aria-hidden="true">
      <path
        d="M2 7 C 20 4.4, 50 3.4, 66 4.8 C 75 5.6, 78 7, 75 8.4 C 70 9.6, 50 10.6, 2 7 Z"
        fill="currentColor"
      />
      <path d="M62 6.4 C 65 6, 70 6.3, 70.5 7 C 70 7.7, 65 8, 62 7.6 Z" fill="var(--paper)" />
    </svg>
  );
}

/** Four-hole button with a cross stitch. */
export function Button({ className, style, delay = 0, inView = true }: DoodleProps) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} aria-hidden="true">
      <g filter="url(#pencil-boil)">
        <Draw d="M30 6 C 44 5, 55 16, 54 30 C 53 45, 42 55, 29 54 C 15 53, 5 43, 6 29 C 7 16, 17 7, 31 7" delay={delay} inView={inView} />
        <Draw d="M30 13 C 40 13, 47 21, 47 30 C 47 40, 39 47, 30 47 C 20 47, 13 39, 13 30 C 13 21, 21 13, 31 14" delay={delay + 0.4} inView={inView} />
        <Draw d="M24 24 L 36 36 M 36 24 L 24 36" delay={delay + 0.8} inView={inView} stroke="var(--thread)" />
      </g>
    </svg>
  );
}

/** Coat hanger. */
export function Hanger({ className, style, delay = 0, inView = true }: DoodleProps) {
  return (
    <svg viewBox="0 0 120 84" className={className} style={style} aria-hidden="true">
      <g filter="url(#pencil)">
        <Draw
          d="M52 18 C 51 9, 62 5, 67 11 C 72 18, 63 23, 60 28 L 60 36 L 9 68 C 2 73, 5 79, 13 79 L 107 79 C 115 79, 118 73, 111 68 L 60 36"
          delay={delay}
          inView={inView}
          duration={1.8}
          strokeWidth={3}
        />
      </g>
    </svg>
  );
}

/** Round-headed dressmaker's pin, used to "pin" previews. */
export function PushPin({ className, style }: DoodleProps) {
  return (
    <svg viewBox="0 0 24 40" className={className} style={style} aria-hidden="true">
      <path d="M12 12 L 12.6 38" stroke="var(--ink)" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="12" cy="9" r="7" fill="var(--thread)" />
      <circle cx="9.5" cy="6.5" r="1.8" fill="rgba(255,255,255,.55)" />
    </svg>
  );
}

/** A loose loop of thread, useful as an underline or divider flourish. */
export function ThreadLoop({ className, style, delay = 0, inView = true }: DoodleProps) {
  return (
    <svg viewBox="0 0 220 40" className={className} style={style} aria-hidden="true">
      <Draw
        d="M2 30 C 40 30, 70 26, 96 22 C 120 18, 128 4, 116 4 C 102 4, 104 26, 130 28 C 160 30, 190 24, 218 18"
        stroke="var(--thread)"
        delay={delay}
        inView={inView}
        duration={1.2}
        strokeWidth={4}
      />
    </svg>
  );
}
