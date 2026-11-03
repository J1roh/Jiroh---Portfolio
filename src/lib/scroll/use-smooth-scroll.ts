import { useEffect } from "react";
import Lenis from "lenis";
import { cancelFrame, frame } from "motion";

/**
 * Share of the gap to the target the page closes each frame. Lenis's default 0.1 drifts on long after the wheel
 * stops and felt heavy (owner, 2026-10-31); higher catches up faster.
 */
const LERP = 0.2;

/** Lenis smooth scrolling driven by motion's frame loop. Off under reduced motion. */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({ anchors: true, lerp: LERP });
    const tick = ({ timestamp }: { timestamp: number }) => lenis.raf(timestamp);
    frame.update(tick, true);
    return () => {
      cancelFrame(tick);
      lenis.destroy();
    };
  }, [enabled]);
}
