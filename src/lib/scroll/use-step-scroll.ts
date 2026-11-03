import { useEffect, type RefObject } from "react";
import { animate, type MotionValue } from "motion/react";

type StepScrollOptions = {
  /** The stretch of the section's pinned scroll that one gesture crosses whole, as progress. */
  from: number;
  to: number;
  /** Glide length, s. */
  durationS: number;
  enabled: boolean;
};

/** Progress this close to an end counts as at it. */
const EDGE = 0.002;
/** After a glide, wheel input stays swallowed until it has been quiet this long, so trackpad momentum doesn't run on. */
const QUIET_MS = 200;

/**
 * One scroll gesture inside [from, to] of a pinned section glides the page to the end it points at: down to `to`,
 * up to `from`, at constant speed (owner, 2026-10-31: eased glides felt heavy). Wheel, touch swipe and the scroll
 * keys; input during the glide is swallowed. Outside the stretch,
 * scrolling is untouched.
 */
export function useStepScroll(section: RefObject<HTMLElement | null>, progress: MotionValue<number>, options: StepScrollOptions) {
  const { from, to, durationS, enabled } = options;

  useEffect(() => {
    if (!enabled) return;
    let glide: ReturnType<typeof animate> | null = null;
    let locked = false;
    let unlock = 0;
    let touchY: number | null = null;

    const release = () => {
      window.clearTimeout(unlock);
      unlock = window.setTimeout(() => { locked = false; }, QUIET_MS);
    };
    const step = (direction: 1 | -1) => {
      const value = progress.get();
      const inside = direction > 0 ? value >= from - EDGE && value < to - EDGE : value > from + EDGE && value <= to + EDGE;
      const element = section.current;
      if (!inside || !element) return false;
      const top = element.getBoundingClientRect().top + window.scrollY;
      const end = top + (direction > 0 ? to : from) * (element.offsetHeight - window.innerHeight);
      locked = true;
      window.clearTimeout(unlock);
      glide = animate(window.scrollY, end, {
        duration: durationS,
        ease: "linear",
        onUpdate: (y) => window.scrollTo(0, y),
        onComplete: () => { glide = null; release(); },
      });
      return true;
    };

    // Capture phase on window, so the smooth-scroll library never sees a gesture this hook takes.
    const onWheel = (event: WheelEvent) => {
      if (locked) {
        if (!glide) release();
      } else if (event.deltaY === 0 || !step(event.deltaY > 0 ? 1 : -1)) return;
      event.preventDefault();
      event.stopPropagation();
    };
    const onKey = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (event.key === " " && target?.closest("a, button")) return;
      const direction = event.key === " " ? (event.shiftKey ? -1 : 1)
        : event.key === "ArrowDown" || event.key === "PageDown" ? 1
        : event.key === "ArrowUp" || event.key === "PageUp" ? -1 : 0;
      if (direction !== 0 && (locked || step(direction))) event.preventDefault();
    };
    const onTouchStart = (event: TouchEvent) => { touchY = event.touches[0]?.clientY ?? null; };
    const onTouchMove = (event: TouchEvent) => {
      if (locked) { event.preventDefault(); return; }
      const y = event.touches[0]?.clientY;
      if (touchY === null || y === undefined || Math.abs(touchY - y) < 8) return;
      if (step(touchY > y ? 1 : -1)) event.preventDefault();
      touchY = null;
    };
    const onTouchEnd = () => {
      touchY = null;
      if (locked && !glide) release();
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      glide?.stop();
      window.clearTimeout(unlock);
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [section, progress, from, to, durationS, enabled]);
}
