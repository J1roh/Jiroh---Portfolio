import { useReducedMotion as useMotionReducedMotion } from "motion/react";

/** True when the visitor asked for reduced motion. Every effect and animation checks this. */
export function useReducedMotion(): boolean {
  return useMotionReducedMotion() ?? false;
}
