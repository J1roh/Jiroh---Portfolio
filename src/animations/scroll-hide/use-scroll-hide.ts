import { useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";

const SHOW_ABOVE_PX = 150;

/** True while scrolling down past the threshold; false on any scroll up. */
export function useScrollHide(enabled: boolean): boolean {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (current) => {
    if (!enabled) return;
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(current > previous && current > SHOW_ABOVE_PX);
  });

  return enabled && hidden;
}
