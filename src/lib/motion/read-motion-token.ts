import { readCssVar } from "../tokens/read-css-var";

type Easing = [number, number, number, number];

/** Duration token from tokens/motion.css, in seconds. */
export function readDuration(name: "fast" | "base" | "reveal" | "stagger"): number {
  const ms = Number(readCssVar(`--motion-${name}`));
  if (Number.isNaN(ms)) throw new Error(`read-motion-token: --motion-${name} is not a number`);
  return ms / 1000;
}

/** Easing token from tokens/motion.css, as a cubic-bezier tuple. */
export function readEasing(name: "out" | "in-out"): Easing {
  const parts = readCssVar(`--ease-${name}`).split(",").map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    throw new Error(`read-motion-token: --ease-${name} is not four numbers`);
  }
  return parts as Easing;
}
