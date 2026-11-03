import type { RefObject } from "react";
import { useScroll } from "motion/react";

/** 0 when a tall section's top reaches the viewport top, 1 when its bottom does: progress through its pinned stage. */
export function usePinProgress(target: RefObject<HTMLElement | null>) {
  return useScroll({ target, offset: ["start start", "end end"] }).scrollYProgress;
}
