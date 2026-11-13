import { useReducedMotion } from "framer-motion";

/**
 * Global SVG filters that make clean vector strokes look hand drawn.
 * - #pencil: a fixed, slightly irregular line.
 * - #pencil-boil: the same, but the noise seed changes a few times per second
 *   so the line gently "boils", like a hand-drawn animation. Static when motion is reduced.
 */
export function PencilFilter() {
  const reduce = useReducedMotion();
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <filter id="pencil" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" />
        </filter>
        <filter id="pencil-boil" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="1" result="noise">
            {!reduce && <animate attributeName="seed" values="1;2;3;4" dur="1s" repeatCount="indefinite" calcMode="discrete" />}
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.6" />
        </filter>
      </defs>
    </svg>
  );
}
