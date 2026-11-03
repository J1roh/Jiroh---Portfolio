import { useEffect, type RefObject } from "react";
import { animate, cubicBezier, type MotionValue } from "motion/react";

type AutoAdvanceOptions = {
  /** Resting with progress inside [from, to) starts the countdown. */
  from: number;
  to: number;
  /** Where to glide to, as progress through the section's pinned scroll. */
  target: number;
  /** Rest this long first, ms. */
  afterMs: number;
  /** Glide length, s. */
  durationS: number;
  enabled: boolean;
};

/** expo.inOut. */
const EASE = cubicBezier(0.87, 0, 0.13, 1);

/**
 * If the visitor rests inside a stretch of a pinned section, glide the page on to `target` (a forced
 * auto-scroll, after alche.studio). Any wheel, touch or key press cancels the glide or the countdown.
 */
export function useAutoAdvance(section: RefObject<HTMLElement | null>, progress: MotionValue<number>, options: AutoAdvanceOptions) {
  const { from, to, target, afterMs, durationS, enabled } = options;

  useEffect(() => {
    if (!enabled) return;
    let timer = 0;
    let glide: ReturnType<typeof animate> | null = null;

    const arm = (value: number) => {
      window.clearTimeout(timer);
      if (glide || value < from || value >= to) return;
      timer = window.setTimeout(() => {
        const element = section.current;
        if (!element) return;
        const top = element.getBoundingClientRect().top + window.scrollY;
        const end = top + target * (element.offsetHeight - window.innerHeight);
        glide = animate(window.scrollY, end, {
          duration: durationS,
          ease: EASE,
          onUpdate: (y) => window.scrollTo(0, y),
          onComplete: () => { glide = null; },
        });
      }, afterMs);
    };
    const cancel = () => {
      window.clearTimeout(timer);
      glide?.stop();
      glide = null;
    };

    arm(progress.get());
    const unsubscribe = progress.on("change", (value) => { if (!glide) arm(value); });
    const inputs = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    inputs.forEach((name) => window.addEventListener(name, cancel, { passive: true }));
    return () => {
      cancel();
      unsubscribe();
      inputs.forEach((name) => window.removeEventListener(name, cancel));
    };
  }, [section, progress, from, to, target, afterMs, durationS, enabled]);
}
