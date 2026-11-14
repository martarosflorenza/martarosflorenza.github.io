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

/** A dressmaker's dress form on its stand, drawn in loose passes. Used large on the info page. */
export function DressForm({ className, style, delay = 0.3, inView = false }: DoodleProps) {
  const strokes: { d: string; red?: boolean; w?: number }[] = [
    // Neck cap
    { d: "M128 38 C 128 27, 172 27, 172 38 C 172 47, 128 47, 128 38" },
    { d: "M131 44 L 131 52 M 169 44 L 169 52" },
    // Left side: shoulder, arm cap, waist, hip
    { d: "M131 52 C 110 58, 82 62, 73 82 C 66 98, 74 122, 83 142 C 92 172, 93 202, 87 232 C 80 262, 69 302, 74 332 C 78 360, 110 374, 150 374" },
    // Right side
    { d: "M169 52 C 190 58, 218 62, 227 82 C 234 98, 226 122, 217 142 C 208 172, 207 202, 213 232 C 220 262, 231 302, 226 332 C 222 360, 190 374, 150 374" },
    // Second, looser pass on the silhouette
    { d: "M76 86 C 70 104, 79 128, 87 150 M 224 86 C 230 104, 221 128, 213 150", w: 1.6 },
    // Arm-hole plates
    { d: "M73 82 C 80 92, 82 112, 80 128 M 227 82 C 220 92, 218 112, 220 128", w: 1.6 },
    // Centre-front seam and princess seams
    { d: "M150 54 C 148 150, 152 262, 150 372", w: 1.4 },
    { d: "M112 64 C 106 140, 118 200, 112 250 C 108 300, 116 340, 122 370 M 188 64 C 194 140, 182 200, 188 250 C 192 300, 184 340, 178 370", w: 1.2 },
    // Bust line
    { d: "M84 150 C 120 172, 180 172, 216 150", w: 1.4 },
    // Tape measure at the waist, in thread red
    { d: "M88 232 C 120 246, 180 246, 212 232 C 222 228, 228 240, 218 246 C 210 250, 214 262, 222 268", red: true, w: 2.2 },
    // Stand
    { d: "M150 374 L 150 524" },
    { d: "M144 386 L 156 386 M 144 520 L 156 520", w: 1.6 },
    { d: "M150 524 C 130 540, 112 552, 96 566 M 150 524 C 170 540, 188 552, 204 566 M 150 524 L 150 572" },
    { d: "M90 568 C 94 566, 100 566, 102 568 M 198 568 C 202 566, 208 566, 210 568", w: 1.6 },
  ];
  return (
    <svg viewBox="50 18 200 560" className={className} style={style} aria-hidden="true">
      <g filter="url(#pencil)">
        {strokes.map((s, i) => (
          <Draw
            key={i}
            d={s.d}
            delay={delay + i * 0.16}
            duration={1.3}
            inView={inView}
            strokeWidth={s.w ?? 2}
            stroke={s.red ? "var(--thread)" : "currentColor"}
          />
        ))}
      </g>
    </svg>
  );
}
