import type { ReactNode } from "react";
import { motion, useSpring, useTransform, type MotionValue } from "motion/react";
import "./grid-mask.css";

type GridMaskProps = {
  /** 0 hidden below the frame, 1 covering it. */
  rise: MotionValue<number>;
  /** Content shown through the mask, laid out against the frame (it stays put while the mask moves). */
  children?: ReactNode;
  className?: string;
  enabled: boolean;
};

/** Crosshairs travel this share of the mask's rise (in frame heights), so they read as a farther layer. */
const CROSS_TRAVEL = 0.6;
/** The crosshairs trail the scroll: a soft spring stands in for "move 8% of the gap each frame". */
const CROSS_LAG = { stiffness: 90, damping: 22, mass: 1 };
/** Must match --mask-arc in grid-mask.css; 0 is a flat top edge (owner, 2026-10-31). */
const ARC_VH = 0;

/**
 * A light panel that rises over the frame from the bottom, its top edge a shallow arc (after alche.studio's
 * transition). It carries a hairline grid and "+" crosshairs; the crosshairs lag behind the scroll and move
 * slower than the panel, for parallax. Children are counter-shifted so they stay fixed to the frame.
 */
export function GridMask({ rise, children, className, enabled }: GridMaskProps) {
  const y = useTransform(rise, (value) => `${(1 - value) * 100}%`);
  // The panel is taller than the frame by the arc (grid-mask.css), so the counter-shift adds that part back.
  const counter = useTransform(rise, (value) => `calc(${-(1 - value) * 100}% - ${(1 - value) * ARC_VH}vh)`);
  const crossLag = useSpring(useTransform(rise, (value) => value * CROSS_TRAVEL * 100), CROSS_LAG);
  const crossPosition = useTransform(crossLag, (offset) => `0 ${(-offset).toFixed(2)}vh`);

  if (!enabled) return null;
  return (
    <motion.div className={["grid-mask", className].filter(Boolean).join(" ")} style={{ y }}>
      <motion.div className="grid-mask__frame" style={{ y: counter }}>
        <div className="grid-mask__grid" aria-hidden="true" />
        <motion.div className="grid-mask__cross" style={{ maskPosition: crossPosition, WebkitMaskPosition: crossPosition }} aria-hidden="true" />
        {children}
      </motion.div>
    </motion.div>
  );
}
